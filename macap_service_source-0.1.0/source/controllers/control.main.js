/******************************************************************************
 * Copyright © 2017 XIN Community                                             *
 *                                                                            *
 * See the DEVELOPER-AGREEMENT.txt and LICENSE.txt files at the top-level     *
 * directory of this distribution for the individual copyright  holder        *
 * information and the developer policies on copyright and licensing.         *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * XIN software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

const request = require('request');
const currency = require('../models/model.coinmarket');
const async = require('async');

const url = 'https://api.coinmarketcap.com/v1/ticker/';

String.prototype.isJson = function(){
    try {
        JSON.parse(this);
    } catch (e) {
        return false;
    }
    return true;
};

module.exports = {

    fetchCurrencies: function(cb){

        request({url:url}, function(err, res, data){

            if(err){

                console.log(err);
                cb(err);

            }else{

                if(data.isJson){

                    data = JSON.parse(data);

                    async.each(data, function(obj, cb){

                        currency.findOneAndUpdate({id:obj.id}, obj, {upsert:true}, function(err) {

                            if(err){
                                console.log(err);
                                cb(err);
                            }else{
                                cb();
                            }

                        });

                    }, function(err){

                        if(err){
                            console.log('Error inserting into DB');
                            cb('Error inserting into DB');
                        }else{
                            cb(null);
                        }

                    });

                }else{

                    console.log('Invalid response format from CoinMarket');
                    cb('Invalid response format from CoinMarket');

                }


            }

        })

    },

    getCurrencies: function(params, cb){

        var skip = params.page*params.results;

        var sort = {};
        sort[params.filter]=1;
        if(params.order=='desc')
            sort[params.filter]=-1;

        if(params.name){

            params.name = params.name.toLowerCase();

            currency.findOne({id:params.name}, function(err, data){
                var result = [data];
                if(err){
                    console.log(err);
                    cb(err);
                }else{
                    cb(null, result);
                }
            });

        }else{
            currency.find({},{},{skip:skip, limit:params.results, sort:sort},function(err, data){

                if(err){
                    console.log(err);
                    cb(err);
                }else{
                    cb(null, data);
                }

            })
        }

    }

};
