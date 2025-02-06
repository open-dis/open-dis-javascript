/**
 * Section 5.3.10.1 Abstract superclass for PDUs relating to minefields. COMPLETE
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
dis.MinefieldStatePdu = function()
{
   /**
    * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
    * @type {number}
    * @instance
    */
   this.protocolVersion = 6;

   /**
    * Exercise ID
    * @type {number}
    * @instance
    */
   this.exerciseID = 0;

   /**
    * Type of pdu, unique for each PDU class
    * @type {number}
    * @instance
    */
   this.pduType = 37;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 8;

   /**
    * Timestamp value
    * @type {number}
    * @instance
    */
   this.timestamp = 0;

   /**
    * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
    * @type {number}
    * @instance
    */
   this.pduLength = 0;

   /**
    * zero-filled array of padding
    * @type {number}
    * @instance
    */
   this.padding = 0;

   /**
    * Minefield ID
    * @type {EntityID}
    * @instance
    */
   this.minefieldID = new dis.EntityID(); 

   /**
    * Minefield sequence
    * @type {number}
    * @instance
    */
   this.minefieldSequence = 0;

   /**
    * force ID
    * @type {number}
    * @instance
    */
   this.forceID = 0;

   /**
    * Number of permieter points
    * @type {number}
    * @instance
    */
   this.numberOfPerimeterPoints = 0;

   /**
    * type of minefield
    * @type {EntityType}
    * @instance
    */
   this.minefieldType = new dis.EntityType(); 

   /**
    * how many mine types
    * @type {number}
    * @instance
    */
   this.numberOfMineTypes = 0;

   /**
    * location of minefield in world coords
    * @type {Vector3Double}
    * @instance
    */
   this.minefieldLocation = new dis.Vector3Double(); 

   /**
    * orientation of minefield
    * @type {Orientation}
    * @instance
    */
   this.minefieldOrientation = new dis.Orientation(); 

   /**
    * appearance bitflags
    * @type {number}
    * @instance
    */
   this.appearance = 0;

   /**
    * protocolMode
    * @type {number}
    * @instance
    */
   this.protocolMode = 0;

   /**
    * perimeter points for the minefield
    * @type {Array<Point>}
    * @instance
    */
    this.perimeterPoints = new Array();
 
   /**
    * Type of mines
    * @type {Array<EntityType>}
    * @instance
    */
    this.mineType = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.MinefieldStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.minefieldID.initFromBinary(inputStream);
       this.minefieldSequence = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.numberOfPerimeterPoints = inputStream.readUByte();
       this.minefieldType.initFromBinary(inputStream);
       this.numberOfMineTypes = inputStream.readUShort();
       this.minefieldLocation.initFromBinary(inputStream);
       this.minefieldOrientation.initFromBinary(inputStream);
       this.appearance = inputStream.readUShort();
       this.protocolMode = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfPerimeterPoints; idx++)
       {
           var anX = new dis.Point();
           anX.initFromBinary(inputStream);
           this.perimeterPoints.push(anX);
       }

       for(var idx = 0; idx < this.numberOfMineTypes; idx++)
       {
           var anX = new dis.EntityType();
           anX.initFromBinary(inputStream);
           this.mineType.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.MinefieldStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.minefieldID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.minefieldSequence);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.numberOfPerimeterPoints);
       this.minefieldType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.numberOfMineTypes);
       this.minefieldLocation.encodeToBinary(outputStream);
       this.minefieldOrientation.encodeToBinary(outputStream);
       outputStream.writeUShort(this.appearance);
       outputStream.writeUShort(this.protocolMode);
       for(var idx = 0; idx < this.perimeterPoints.length; idx++)
       {
        this.perimeterPoints[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.mineType.length; idx++)
       {
        this.mineType[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldStatePdu = dis.MinefieldStatePdu;

// End of MinefieldStatePdu class

