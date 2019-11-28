/**
 * Does not work, and causes failure in anything it is embedded in. Section 6.2.83
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


dis.StandardVariableSpecification = function()
{
   /** Number of static variable records */
   this.numberOfStandardVariableRecords = 0;

   /** variable length list of standard variables, The class type and length here are WRONG and will cause the incorrect serialization of any class in whihc it is embedded. */
    this.standardVariables = new Array();
 
  dis.StandardVariableSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfStandardVariableRecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfStandardVariableRecords; idx++)
       {
           var anX = new dis.SimulationManagementPduHeader();
           anX.initFromBinary(inputStream);
           this.standardVariables.push(anX);
       }

  };

  dis.StandardVariableSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfStandardVariableRecords);
       for(var idx = 0; idx < this.standardVariables.length; idx++)
       {
        this.standardVariables[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.StandardVariableSpecification = dis.StandardVariableSpecification;

// End of StandardVariableSpecification class

