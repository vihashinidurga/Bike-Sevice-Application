const express = require('express');
const Service = require('../models/serviceModel');
const User=require('../models/userModel');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware=require('../middlewares/roleMiddleware');
const router = express.Router();

//Get all services
router.get('/',authMiddleware, async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//Get a specific service by ID
router.get('/:id',authMiddleware,roleMiddleware('owner'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//Create a new service

router.post('/', authMiddleware, roleMiddleware('owner'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const ownerId = req.user.userId;

    // Check if the owner exists
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Create new service
    const newService = new Service({
      ownerId,
      name,
      description,
      price,
    });

    // Save the new service
    await newService.save();

    // Populate owner's details
    const populatedService = await Service.findById(newService._id).populate('ownerId', 'shopName');

    if (!populatedService.ownerId) {
      return res.status(500).json({ message: 'Failed to populate owner details' });
    }

    const shopName = populatedService.ownerId.shopName;

    res.status(201).json({
      message: `Service created successfully for shop: ${shopName}`,
      service: populatedService,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update a service by ID
router.put('/:id', authMiddleware,roleMiddleware('owner'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    service.name = name || service.name;
    service.description = description || service.description;
    service.price = price || service.price;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//Delete a service by ID
router.delete('/:id', authMiddleware,roleMiddleware('owner'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await service.remove();
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
