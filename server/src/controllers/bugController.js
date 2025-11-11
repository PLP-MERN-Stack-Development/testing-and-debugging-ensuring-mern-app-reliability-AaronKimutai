const Bug = require('../models/Bug');

const getBugs = async (req, res, next) => {

  console.time('GET /api/bugs query'); 
  try {
    const bugs = await Bug.find().sort({ createdAt: -1 });
    res.status(200).json(bugs);
  } catch (error) {
    next(error);
  }


  console.timeEnd('GET /api/bugs query');
};


const getBugById = async (req, res, next) => {
  try {
    const bug = await Bug.findById(req.params.id);
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }
    res.status(200).json(bug);
  } catch (error) {
    next(error);
  }
};


const createBug = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    const newBug = new Bug({ title, description, priority });
    const savedBug = await newBug.save();
    res.status(201).json(savedBug);
  } catch (error) {
    next(error);
  }
};


const updateBug = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updatedBug = await Bug.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedBug) {
      return res.status(404).json({ message: 'Bug not found' });
    }
    res.status(200).json(updatedBug);
  } catch (error) {
    next(error);
  }
};


const deleteBug = async (req, res, next) => {
  try {
    const deletedBug = await Bug.findByIdAndDelete(req.params.id);
    if (!deletedBug) {
      return res.status(404).json({ message: 'Bug not found' });
    }
    res.status(200).json({ message: 'Bug deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
};