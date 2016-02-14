/**
 * Identity of a communications node. Section 6.2.50
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


null.LaunchedMunitionRecord = function()
{
   this.fireEventID = new null.EventIdentifier(); 

   this.padding = 0;

   this.firingEntityID = new null.EventIdentifier(); 

   this.padding2 = 0;

   this.targetEntityID = new null.EventIdentifier(); 

   this.padding3 = 0;

   this.targetLocation = new null.Vector3Double(); 

  null.LaunchedMunitionRecord.prototype.initFromBinary = function(inputStream)
  {
       this.fireEventID.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.firingEntityID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
       this.targetEntityID.initFromBinary(inputStream);
       this.padding3 = inputStream.readUShort();
       this.targetLocation.initFromBinary(inputStream);
  };

  null.LaunchedMunitionRecord.prototype.encodeToBinary = function(outputStream)
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
exports.LaunchedMunitionRecord = null.LaunchedMunitionRecord;

// End of LaunchedMunitionRecord class

