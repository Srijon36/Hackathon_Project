const Bill = require("../../models/billModel/billModel");

// CREATE BILL
exports.createBill = async (req, res, next) => {
  try {
    const bill = await Bill.create({
      ...req.body,
      userId: req.user.id, // ✅ attach logged-in user's id
    });

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: bill,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL BILLS
exports.getAllBills = async (req, res,next) => {
  try {
    const bills = await Bill.find({ userId: req.user.id }); // ✅ only this user's bills

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET BILL BY ID
exports.getBillById = async (req, res,next) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: req.user.id, // ✅ must belong to this user
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE BILL
exports.updateBill = async (req, res,next) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // ✅ must be owner
      req.body,
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      data: bill,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE BILL
exports.deleteBill = async (req, res,next) => {
  try {
    const bill = await Bill.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, // ✅ must be owner
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found" });
    }

    res.status(200).json({ success: true, message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};