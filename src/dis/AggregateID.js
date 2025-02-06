/**
 * Section 5.2.36. Each agregate in a given simulation app is given an aggregate identifier number unique for all other aggregates in that app and in that exercise. The id is valid for the duration of the the exercise.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.AggregateID = function()
{
   /**
    * The site ID
    * @type {number}
    * @instance
    */
   this.site = 0;

   /**
    * The application ID
    * @type {number}
    * @instance
    */
   this.application = 0;

   /**
    * the aggregate ID
    * @type {number}
    * @instance
    */
   this.aggregateID = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.AggregateID.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.aggregateID = inputStream.readUShort();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.AggregateID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.aggregateID);
  };
}; // end of class

 // node.js module support
exports.AggregateID = dis.AggregateID;

// End of AggregateID class

