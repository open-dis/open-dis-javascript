/**
 * information abou an enitity not producing espdus. Section 6.2.79
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


dis.SilentEntitySystem = function()
{
   /** number of the type specified by the entity type field */
   this.numberOfEntities = 0;

   /** number of entity appearance records that follow */
   this.numberOfAppearanceRecords = 0;

   /** Entity type */
   this.entityType = new dis.EntityType(); 

   /** Variable length list of appearance records */
    this.appearanceRecordList = new Array();
 
  dis.SilentEntitySystem.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfEntities = inputStream.readUShort();
       this.numberOfAppearanceRecords = inputStream.readUShort();
       this.entityType.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfAppearanceRecords; idx++)
       {
           var anX = new dis.Chunk(4);
           anX.initFromBinary(inputStream);
           this.appearanceRecordList.push(anX);
       }

  };

  dis.SilentEntitySystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfEntities);
       outputStream.writeUShort(this.numberOfAppearanceRecords);
       this.entityType.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.appearanceRecordList.length; idx++)
       {
        this.appearanceRecordList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SilentEntitySystem = dis.SilentEntitySystem;

// End of SilentEntitySystem class

