/**
 * Section 5.3.10.4 proivde the means to request a retransmit of a minefield data pdu. COMPLETE
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
dis.MinefieldResponseNackPdu = function()
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
   this.pduType = 40;

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
    * entity ID making the request
    * @type {EntityID}
    * @instance
    */
   this.requestingEntityID = new dis.EntityID(); 

   /**
    * request ID
    * @type {number}
    * @instance
    */
   this.requestID = 0;

   /**
    * how many pdus were missing
    * @type {number}
    * @instance
    */
   this.numberOfMissingPdus = 0;

   /**
    * PDU sequence numbers that were missing
    * @type {Array<Chunk>}
    * @instance
    */
    this.missingPduSequenceNumbers = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
  dis.MinefieldResponseNackPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.minefieldID.initFromBinary(inputStream);
       this.requestingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUByte();
       this.numberOfMissingPdus = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfMissingPdus; idx++)
       {
           var anX = new dis.Chunk(8);
           anX.initFromBinary(inputStream);
           this.missingPduSequenceNumbers.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.MinefieldResponseNackPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.minefieldID.encodeToBinary(outputStream);
       this.requestingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requestID);
       outputStream.writeUByte(this.numberOfMissingPdus);
       for(var idx = 0; idx < this.missingPduSequenceNumbers.length; idx++)
       {
        this.missingPduSequenceNumbers[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldResponseNackPdu = dis.MinefieldResponseNackPdu;

// End of MinefieldResponseNackPdu class

