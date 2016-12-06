/**
 * DE Precision Aimpoint Record. NOT COMPLETE. Section 6.2.20.2
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


dis.DirectedEnergyAreaAimpoint = function()
{
   /** Type of Record enumeration */
   this.recordType = 4001;

   /** Length of Record */
   this.recordLength = 0;

   /** Padding */
   this.padding = 0;

   /** Number of beam antenna pattern records */
   this.beamAntennaPatternRecordCount = 0;

   /** Number of DE target energy depositon records */
   this.directedEnergyTargetEnergyDepositionRecordCount = 0;

   /** list of beam antenna records. See 6.2.9.2 */
   this.beamAntennaParameterList = new dis.BeamAntennaPattern(); 

   /** list of DE target deposition records. See 6.2.21.4 */
   this.directedEnergyTargetEnergyDepositionRecordList = new dis.DirectedEnergyTargetEnergyDeposition(); 

  dis.DirectedEnergyAreaAimpoint.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.beamAntennaPatternRecordCount = inputStream.readUShort();
       this.directedEnergyTargetEnergyDepositionRecordCount = inputStream.readUShort();
       this.beamAntennaParameterList.initFromBinary(inputStream);
       this.directedEnergyTargetEnergyDepositionRecordList.initFromBinary(inputStream);
  };

  dis.DirectedEnergyAreaAimpoint.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUShort(this.beamAntennaPatternRecordCount);
       outputStream.writeUShort(this.directedEnergyTargetEnergyDepositionRecordCount);
       this.beamAntennaParameterList.encodeToBinary(outputStream);
       this.directedEnergyTargetEnergyDepositionRecordList.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyAreaAimpoint = dis.DirectedEnergyAreaAimpoint;

// End of DirectedEnergyAreaAimpoint class

