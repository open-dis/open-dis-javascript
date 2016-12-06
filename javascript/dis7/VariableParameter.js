/**
 * specification of additional information associated with an entity or detonation, not otherwise accounted for in a PDU 6.2.94.1
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.VariableParameter = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 0;

   /** Variable parameter data fields. Two doubles minus one byte */
   this.variableParameterFields1 = 0;

   /** Variable parameter data fields.  */
   this.variableParameterFields2 = 0;

   /** Variable parameter data fields.  */
   this.variableParameterFields3 = 0;

   /** Variable parameter data fields.  */
   this.variableParameterFields4 = 0;

  dis.VariableParameter.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.variableParameterFields1 = inputStream.readFloat64();
       this.variableParameterFields2 = inputStream.readUInt();
       this.variableParameterFields3 = inputStream.readUShort();
       this.variableParameterFields4 = inputStream.readUByte();
  };

  dis.VariableParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeFloat64(this.variableParameterFields1);
       outputStream.writeUInt(this.variableParameterFields2);
       outputStream.writeUShort(this.variableParameterFields3);
       outputStream.writeUByte(this.variableParameterFields4);
  };
}; // end of class

 // node.js module support
exports.VariableParameter = dis.VariableParameter;

// End of VariableParameter class

