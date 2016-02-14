/**
 * Does not work, and causes failure in anything it is embedded in. Section 6.2.83
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.StandardVariableSpecification = function()
{
   /** Number of static variable records */
   this.numberOfStandardVariableRecords = 0;

   /** variable length list of standard variables, The class type and length here are WRONG and will cause the incorrect serialization of any class in whihc it is embedded. */
    this.standardVariables = new Array();
 
  null.StandardVariableSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfStandardVariableRecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfStandardVariableRecords; idx++)
       {
           var anX = new null.SimulationManagementPduHeader();
           anX.initFromBinary(inputStream);
           this.standardVariables.push(anX);
       }

  };

  null.StandardVariableSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfStandardVariableRecords);
       for(var idx = 0; idx < this.standardVariables.length; idx++)
       {
           standardVariables[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.StandardVariableSpecification = null.StandardVariableSpecification;

// End of StandardVariableSpecification class

