/**
 * Section 5.2.5. Articulation parameters for  movable parts and attached parts of an entity. Specifes wether or not a change has occured,  the part identifcation of the articulated part to which it is attached, and the type and value of each parameter.
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
dis.ArticulationParameter = function()
{
   /**
    * @type {number}
    * @instance
    */
   this.parameterTypeDesignator = 0;

   /**
    * @type {number}
    * @instance
    */
   this.changeIndicator = 0;

   /**
    * @type {number}
    * @instance
    */
   this.partAttachedTo = 0;

   /**
    * @type {number}
    * @instance
    */
   this.parameterType = 0;

   /**
    * @type {number}
    * @instance
    */
   this.parameterValue = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.ArticulationParameter.prototype.initFromBinary = function(inputStream)
  {
       this.parameterTypeDesignator = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readInt();
       this.parameterValue = inputStream.readFloat64();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.ArticulationParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.parameterTypeDesignator);
       outputStream.writeUByte(this.changeIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeInt(this.parameterType);
       outputStream.writeFloat64(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.ArticulationParameter = dis.ArticulationParameter;

// End of ArticulationParameter class

