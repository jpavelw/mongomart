/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function CartDAO(database) {
    "use strict";

    this.db = database;


    this.getCart = function(userId, callback) {
        "use strict";

        this.db.collection('cart').findOne({ userId: userId }, function(error, userCart){
            assert.equal(null, error);
            callback(userCart);
        });
    }


    this.itemInCart = function(userId, itemId, callback) {
        "use strict";

         var expression_ = { userId: userId, "items._id": itemId };
         var projection_ = { "items.$": 1, _id: itemId };

         this.db.collection('cart').find(expression_, projection_).toArray(function(error, docs){
             assert.equal(null, error);
             if(docs.length == 0) {
                callback(null);
            } else {
                callback(docs[0].items[0]);
            }
         });
    }

    this.addItem = function(userId, item, callback) {
        "use strict";

        this.db.collection("cart").findOneAndUpdate(
            {userId: userId},
            {"$push": {items: item}},
            {
                upsert: true,
                returnOriginal: false
            },
            function(err, result) {
                assert.equal(null, err);
                callback(result.value);
            });

    };


    this.updateQuantity = function(userId, itemId, quantity, callback) {
        "use strict";

        var query_ = { userId: userId, "items._id": itemId };
        var update_ = { $set: { "items.$.quantity": quantity } };
        var options_ = { returnOriginal: false };

        if(quantity == 0){
            update_ = { $pull: { items: { _id: itemId } } };
        }

        this.db.collection('cart').findOneAndUpdate(query_, update_, options_, function(error, doc){
            assert.equal(null, error);
            callback(doc.value);
        });

    }

    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            quantity: 1,
            reviews: []
        };

        return item;
    }

}


module.exports.CartDAO = CartDAO;
