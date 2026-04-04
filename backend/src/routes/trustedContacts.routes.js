// src/routes/trustedContacts.routes.js
import express from 'express';
import TrustedContact from '../models/TrustedContact.js'; // ✅ import model

const router = express.Router();

// ============ GET ALL CONTACTS ============
router.get('/', async (req, res) => {
  try {
    const contacts = await TrustedContact.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message,
    });
  }
});

// ============ GET SINGLE CONTACT ============
router.get('/:id', async (req, res) => {
  try {
    const contact = await TrustedContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message,
    });
  }
});

// ============ CREATE CONTACT ============
router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    // Phone number validation (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format. Please provide a valid 10-digit number',
      });
    }

    const newContact = new TrustedContact({
      name: name.trim(),
      phone: phone.trim(),
    });

    const savedContact = await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      data: savedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding contact',
      error: error.message,
    });
  }
});

// ============ UPDATE CONTACT ============
router.put('/:id', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    // Phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    const updatedContact = await TrustedContact.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), phone: phone.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message,
    });
  }
});

// ============ DELETE CONTACT ============
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await TrustedContact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      data: deletedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message,
    });
  }
});

export default router;