const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bikeSchema = new Schema({
    title: {type: String, required: [true, 'title is required']}, 
    seller: {type: Schema.Types.ObjectId, ref: 'User'},
    condition: {type: String, required: [true, 'condition is required'], enum: ['New', 'Used', 'Parts Only', 'Like New', 'Fair']},
    price: {type: Number, required: [true, 'price is required'], min: [0.01, 'price must be at least $0.01'] },
    details: {type: String, required: [true, 'details are required'], minLength: [10, 'the details should have at least 10 characters']},
    image:  {type: String},
    totalOffers: {type: Number},
    active: {type: Boolean},
    highestOffer: {type: Number, default: 0}
    },
    {timestamps: true}
);

bikeSchema.index({ title: 'text', details: 'text' });

// Define searchInventory as a static method of the schema
bikeSchema.statics.searchInventory = async function(query) {
    try {
        const results = await this.find({
            $or: [
                { title: { $regex: new RegExp(query, 'i') } },
                { details: { $regex: new RegExp(query, 'i') } }
            ]
        });
        return results;
    } catch (error) {
        console.error("Error searching inventory:", error);
        return [];
    }
};

// collection name is bikes in the database
module.exports = mongoose.model('Bike', bikeSchema);