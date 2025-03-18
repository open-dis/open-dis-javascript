/**
 * Section 5.3.11.5: Information about the addition/modification of an oobject that is geometrically      achored to the terrain with a set of three or more points that come to a closure. COMPLETE
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
dis.ArealObjectStatePdu = function()
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
   this.pduType = 45;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 9;

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
    * Object in synthetic environment
    * @type {EntityID}
    * @instance
    */
   this.objectID = new dis.EntityID(); 

   /**
    * Object with which this point object is associated
    * @type {EntityID}
    * @instance
    */
   this.referencedObjectID = new dis.EntityID(); 

   /**
    * unique update number of each state transition of an object
    * @type {number}
    * @instance
    */
   this.updateNumber = 0;

   /**
    * force ID
    * @type {number}
    * @instance
    */
   this.forceID = 0;

   /**
    * modifications enumeration
    * @type {number}
    * @instance
    */
   this.modifications = 0;

   /**
    * Object type
    * @type {EntityType}
    * @instance
    */
   this.objectType = new dis.EntityType(); 

   /**
    * Object appearance
    * @type {Chunk}
    * @instance
    */
   this.objectAppearance = new dis.Chunk(6);

   /**
    * Number of points
    * @type {number}
    * @instance
    */
   this.numberOfPoints = 0;

   /**
    * requesterID
    * @type {SimulationAddress}
    * @instance
    */
   this.requesterID = new dis.SimulationAddress(); 

   /**
    * receiver ID
    * @type {SimulationAddress}
    * @instance
    */
   this.receivingID = new dis.SimulationAddress(); 

   /**
    * location of object
    * @type {Array<Vector3Double>}
    * @instance
    */
    this.objectLocation = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.ArealObjectStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.objectID.initFromBinary(inputStream);
       this.referencedObjectID.initFromBinary(inputStream);
       this.updateNumber = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.modifications = inputStream.readUByte();
       this.objectType.initFromBinary(inputStream);
       this.objectAppearance.initFromBinary(inputStream);
       this.numberOfPoints = inputStream.readUShort();
       this.requesterID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfPoints; idx++)
       {
           var anX = new dis.Vector3Double();
           anX.initFromBinary(inputStream);
           this.objectLocation.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.ArealObjectStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.objectID.encodeToBinary(outputStream);
       this.referencedObjectID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.updateNumber);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.modifications);
       this.objectType.encodeToBinary(outputStream);
       this.objectAppearance.encodeToBinary(outputStream);
       outputStream.writeUShort(this.numberOfPoints);
       this.requesterID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.objectLocation.length; idx++)
       {
        this.objectLocation[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ArealObjectStatePdu = dis.ArealObjectStatePdu;

// End of ArealObjectStatePdu class

