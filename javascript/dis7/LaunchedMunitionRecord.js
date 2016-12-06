/**
 * Identity of a communications node. Section 6.2.50
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


dis.LaunchedMunitionRecord = function()
{
   this.fireEventID = new dis.EventIdentifier(); 

   this.padding = 0;

   this.firingEntityID = new dis.EventIdentifier(); 

   this.padding2 = 0;

   this.targetEntityID = new dis.EventIdentifier(); 

   this.padding3 = 0;

   this.targetLocation = new dis.Vector3Double(); 

  dis.LaunchedMunitionRecord.prototype.initFromBinary = function(inputStream)
  {
       this.fireEventID.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.firingEntityID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
       this.targetEntityID.initFromBinary(inputStream);
       this.padding3 = inputStream.readUShort();
       this.targetLocation.initFromBinary(inputStream);
  };

  dis.LaunchedMunitionRecord.prototype.encodeToBinary = function(outputStream)
  {
       this.fireEventID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding2);
       this.targetEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding3);
       this.targetLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.LaunchedMunitionRecord = dis.LaunchedMunitionRecord;

// End of LaunchedMunitionRecord class

