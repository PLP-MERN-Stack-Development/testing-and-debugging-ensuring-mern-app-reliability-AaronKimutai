const express = require('express');
const router = express.Router();
const { createBug, getBugs, getBugById, updateBug, deleteBug  }= require('../controllers/bugController'); 

router.post('/', createBug);
router.get('/', getBugs);
router.get('/:id', getBugById);
router.put('/:id', updateBug);
router.delete('/:id', deleteBug);

module.exports = router;
