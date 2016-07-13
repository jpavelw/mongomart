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

function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

        var categories = [{
            _id: "All",
            num: 0
        }];

        var expression_ = [{
            $project: {
                _id: 0, category: 1
            } }, {
                $group: {
                    _id: "$category", num: {
                        $sum: 1
                    }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }
        ];

        this.db.collection('item').aggregate(expression_).toArray(function(error, docs){
            assert.equal(error, null);
            categories = categories.concat(docs);

            docs.forEach(function(doc){
                categories[0].num = categories[0].num + doc.num;
            });
            callback(categories);
        });
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

         var expression_ = { category: category };

         if (category == "All") {
             expression_ = {};
         }

         this.db.collection('item').find(expression_).sort({_id: 1}).skip(page * itemsPerPage).limit(itemsPerPage).toArray(function(error, docs){
             assert.equal(null, error);
             callback(docs);
         });

    }


    this.getNumItems = function(category, callback) {
        "use strict";

         var expression_ = { category: category };

         if (category == "All") {
             expression_ = {};
         }

         this.db.collection('item').find(expression_).toArray(function(error, docs){
             assert.equal(null, error);
             callback(docs.length);
         });
    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

         var expresion_ = { $text: { $search: query } };

         this.db.collection('item').find(expresion_).sort({_id: 1}).skip(page * itemsPerPage).limit(itemsPerPage).toArray(function(error, docs){
            assert.equal(null, error);
            callback(docs);
         });
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var numItems = 0;

        var expresion_ = { $text: { $search: query } };

        this.db.collection('item').find(expresion_).toArray(function(error, docs){
           assert.equal(null, error);
           callback(docs.length);
        });

    }


    this.getItem = function(itemId, callback) {
        "use strict";

        this.db.collection('item').findOne({ _id: itemId }, function(error, doc){
            assert.equal(null, error);
            callback(doc);
        });

    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        this.db.collection('item').updateOne(
            { _id: itemId },
            { $push: { reviews: reviewDoc } },
            function(error, result){
                assert.equal(null, error);
                assert.equal(result.result.n, 1);
                callback(null);
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
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
