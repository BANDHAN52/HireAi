
import Job from "../models/Job.js";
import Application from "../models/Application.js";


export const createJob = async (req, res, next) => {
  try {
    const {
      title, description, jobType, location,
      salary, experience, requiredSkills, deadline
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

   
    const job = await Job.create({
      title,
      description,
      company: req.user._id,  // protect middleware থেকে পাচ্ছি
      jobType: jobType || "full-time",
      location: location || "Remote",
      salary: salary || { min: 0, max: 0, currency: "BDT" },
      experience: experience || "any",
      requiredSkills: requiredSkills || [],
      deadline: deadline || null,
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      job,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllJobs = async (req, res, next) => {
  try {
    
    const {
      search,       // Keyword search
      jobType,      // full-time, remote ইত্যাদি
      location,     // Dhaka, Remote
      experience,   // entry, mid, senior
      skills,       // comma separated: "React,Node.js"
      page = 1,     // Default page 1
      limit = 10,   // Per page 10 jobs
    } = req.query;


    const filter = { status: "open" }; // শুধু open jobs দেখাবো

    
    if (search) {
      filter.$text = { $search: search };
      
    }

    if (jobType) filter.jobType = jobType;
    if (location) filter.location = { $regex: location, $options: "i" }; // Case insensitive
    if (experience) filter.experience = experience;


    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      filter.requiredSkills = { $in: skillsArray }; // $in — array এর যেকোনো একটা match
    }


    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum; // Page 2 হলে skip = 10

    // ── Database query ──
    const [jobs, totalJobs] = await Promise.all([
      // Promise.all — দুটো query একসাথে চালাও (faster)
      Job.find(filter)
        .populate("company", "name companyName companyLogo location") 
        .sort({ createdAt: -1 }) // নতুন jobs আগে
        .skip(skip)
        .limit(limitNum),

      Job.countDocuments(filter), // Total count pagination এর জন্য
    ]);

    res.status(200).json({
      success: true,
      results: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limitNum),
      currentPage: pageNum,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};


export const getJobById = async (req, res, next) => {
  try {
    // req.params.id — URL এর :id part
    const job = await Job.findById(req.params.id)
      .populate("company", "name companyName companyLogo companyDescription companyWebsite location");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }


    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own job posts.",
      });
    }

  
    const allowedUpdates = [
      "title", "description", "jobType", "location",
      "salary", "experience", "requiredSkills", "status", "deadline"
    ];


    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
      // new: true — updated document return করবে
      // runValidators: true — schema validation চলবে
    );

    res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own job posts.",
      });
    }

    await job.deleteOne(); 
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


export const getMyCompanyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ company: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};
