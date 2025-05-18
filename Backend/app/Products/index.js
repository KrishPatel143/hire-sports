const express = require('express');
const router = express.Router();
const controllers = require('./lib/controllers.js');

router.get('/', controllers.getProduct);
router.get('/search', controllers.searchProduct);
router.get('/related/:productId', controllers.relatedProducts);
router.get('/:productId', controllers.singleProduct);
router.post('/', controllers.createProduct);
router.put('/:productId', controllers.updateProduct);
router.delete('/:productId', controllers.deleteProduct);

router.post('/:productId/reviews', controllers.reviewProduct);

module.exports = router;