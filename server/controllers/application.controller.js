
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { calculateMatchScore } from "../utils/ai.utils.js";
import { sendEmail } from "../utils/email.utils.js";


export const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    
    const job = await Job.findById(jobId).populate("company", "name email companyName");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    
    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications.",
      });
    }

   
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    
    const candidate = await User.findById(req.user._id);

  
    const { score, matchedSkills, missingSkills } = calculateMatchScore(
      candidate.skills,          // Candidate এর skills
      job.requiredSkills         // Job এর required skills
    );

    
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      matchScore: score,
      matchDetails: { matchedSkills, missingSkills },
      coverLetter: coverLetter || "",
      resumeUrl: candidate.resumeUrl || "",
    });

    
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });
    // $inc — increment operator, 1 বাড়াবে


    try {
      await sendEmail({
        to: job.company.email,
        subject: `New Application: ${job.title}`,
        html: `
          <h2>New Job Application Received</h2>
          <p><strong>${candidate.name}</strong> has applied for <strong>${job.title}</strong></p>
          <p>AI Match Score: <strong>${score}%</strong></p>
          <p>Matched Skills: ${matchedSkills.join(", ") || "None"}</p>
          <p>Login to your dashboard to review the application.</p>
        `,
      });
    } catch (emailError) {
      
      console.error("Email notification failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application: {
        id: application._id,
        matchScore: score,
        matchedSkills,
        missingSkills,
        status: application.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job", "title location jobType salary status")
      .populate({
        path: "job",
        populate: { path: "company", select: "companyName companyLogo" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};


export const getJobApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

   
    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You don't own this job.",
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
     .populate("applicant", "name email skills experience education location resumeUrl githubUrl linkedinUrl bio avatar")
      .sort({ matchScore: -1 }); // Match score বেশি হলে আগে দেখাবে

    res.status(200).json({
      success: true,
      results: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};


export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, companyNote } = req.body;

    const validStatuses = ["pending", "reviewing", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

  
    const application = await Application.findById(req.params.id)
      .populate("job", "title company")
      .populate("applicant", "name email");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

   
    if (application.job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    application.status = status;
    if (companyNote) application.companyNote = companyNote;
    await application.save();

   
    const statusMessages = {
      reviewing: "is being reviewed",
      shortlisted: "has been shortlisted! 🎉",
      rejected: "was not selected this time",
      hired: "has been accepted! Congratulations! 🎊",
    };

    if (statusMessages[status]) {
      try {
        await sendEmail({
          to: application.applicant.email,
          subject: `Application Update: ${application.job.title}`,
          html: `
            <h2>Application Status Update</h2>
            <p>Hi ${application.applicant.name},</p>
            <p>Your application for <strong>${application.job.title}</strong> ${statusMessages[status]}.</p>
            ${companyNote ? `<p><strong>Note from company:</strong> ${companyNote}</p>` : ""}
            <p>Login to HireAI to see more details.</p>
          `,
        });
      } catch (emailError) {
        console.error("Status email failed:", emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Application status updated!",
      application,
    });
  } catch (error) {
    next(error);
  }
};
