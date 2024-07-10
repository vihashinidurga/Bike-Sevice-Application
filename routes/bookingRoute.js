const express = require("express");
const nodemailer = require("nodemailer");
const Booking = require("../models/bookingModel");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const User = require("../models/userModel");
const Service = require("../models/serviceModel");
const { text } = require("body-parser");
const schedule = require("node-schedule");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//Get all bookings for a user (customer)
router.get("/customer", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.user.userId,
    }).populate("serviceId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//Get all bookings for a shop owner
router.get("/owner", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user.userId }).populate(
      "serviceId"
    );
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//Get a specific booking by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


//Create a new booking
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { serviceId, date } = req.body;

    const service = await Service.findById(serviceId).populate("ownerId");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (!service.ownerId) {
      return res.status(400).json({ message: "Service owner not found" });
    }

    const newBooking = new Booking({
      customerId: req.user.userId,
      serviceId,
      ownerId: service.ownerId._id,
      date,
    });

    await newBooking.save();
    const populatedBooking = await Booking.findById(newBooking._id).populate(
      "serviceId"
    );

    //Send email to the owner from admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: service.ownerId.email,
      subject: "New Booking Received",
      text: `You have received a new booking for the service: ${service.name} on ${date}. Please check your bookings for more details.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      } else {
        res.status(201).json({
          message: "Booking created successfully and email sent to the owner",
          booking: populatedBooking,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//Update a booking details by customer
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { serviceId, date, status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    if (serviceId) booking.serviceId = serviceId;
    if (date) booking.date = date;
    if (status) booking.status = status;

    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


//Update status by owner

router.put("/status/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate(
      "customerId serviceId"
    );

    if (!booking) {
      return res.status(400).json({ message: "Booking not found" });
    }
    const service = await Service.findById(booking.serviceId).populate(
      "ownerId"
    );
    if (!service || !service.ownerId) {
      return res.status(404).json({ message: "Service or owner not found" });
    }
    booking.status = status;
    await booking.save();

    //send mail after updating status from owner to customer mail
    const customerEmail = booking.customerId.email;
    const ownerEmail = service.ownerId.email;
    const serviceName = service.name;
    const mailOptions = {
      from: ownerEmail,
      to: customerEmail,
      subject: "Booking Status Update",
      text: `Dear ${booking.customerId.name},\n\nYour booking for the service ${serviceName} is now ${status}.\n\nRegards,\n${service.ownerId.name}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: error.message });
      } else {
        res.status(200).json({
          message: `Booking status updated to ${status} and email sent to the customer from owner`,
          booking,
        });
      }
    });

    //updates the status of service to completed after 35 minutes of updating the status to ready for delivery and send an mail
    if (status == "ready for delivery") {
      const updateTime = new Date();
      updateTime.setMinutes(updateTime.getMinutes() + 35);

      schedule.scheduleJob(updateTime, async function () {
        booking.status = "completed";
        await booking.save();

        const completedMailOption = {
          from: ownerEmail,
          to: customerEmail,
          subject: "Booking is Completed",
          text: `Dear ${booking.customerId.name},, \n\n Your booking for the service ${serviceName} has been completed. \n\nRegards, \n${service.ownerId.name}`,
        };

        transporter.sendMail(completedMailOption, (error, info) => {
          if (error) {
            return res.status(500).json({ message: error.message });
          } else {
            console.log("Completion mail sent!!", info.response);
          }
        });
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//Delete a booking by ID (customer)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking:", booking); 
    console.log("Customer ID:", booking.customerId); 

    if (booking.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    await booking.remove();
    res.json({ message: "Booking removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
