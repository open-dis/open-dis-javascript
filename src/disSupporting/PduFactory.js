
if (typeof dis === "undefined")
 dis = {};

// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

 /**
  * The PDU factory is responsible for decoding binary data and turning
  * it into the appropriate type of PDU.
  *
  * The websocket will typically send the web page a IEEE 1278.1 binary
  * array of data. It could be any one of dozens of PDUs. The start of
  * all PDUs is the same--they have the same header. One of the fields in
  * the header is the PduType, an 8 bit integer with a unqiue value for
  * each type of PDU. We have to peak at that value, decide what type
  * of PDU to create of the binary we have received, and then decode it.
  *
  *     * @DMcG
  */

 dis.PduFactory = function()
 {

 };

 /**
  * decode incoming binary data and
  * return the correct type of PDU.
  *
  * @param {type} data the IEEE 1278.1 binary data
  * @returns {Pdu} Returns an instance of some PDU, be it espdu, fire, detonation, etc. Exception if PduType not known.
  */
 dis.PduFactory.prototype.createPdu = function(data)
 {
     var asUint8Array = new Uint8Array(data);
     var pduType = asUint8Array[2];
     var inputStream = new dis.InputStream(data);
     var newPdu = null;
     switch(pduType) {
        case 1:
            newPdu = new dis.EntityStatePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 2:
            newPdu = new dis.FirePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 3:
            newPdu = new dis.DetonationPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 4:
            newPdu = new dis.CollisionPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 5:
            newPdu = new dis.ServiceRequestPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 6:
            newPdu = new dis.CollisionElasticPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 7:
            newPdu = new dis.ResupplyReceivedPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 9:
            newPdu = new dis.RepairCompletePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 10:
            newPdu = new dis.RepairResponsePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 11:
            newPdu = new dis.CreateEntityPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 12:
            newPdu = new dis.RemoveEntityPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 13:
            newPdu = new dis.StartResumePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 14:
            newPdu = new dis.StopFreezePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 15:
            newPdu = new dis.AcknowledgePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 16:
            newPdu = new dis.ActionRequestPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 17:
            newPdu = new dis.ActionResponsePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 18:
            newPdu = new dis.DataQueryPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 19:
            newPdu = new dis.SetDataPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 20:
            newPdu = new dis.DataPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 21:
            newPdu = new dis.EventReportPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 22:
            newPdu = new dis.CommentPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 23:
            newPdu = new dis.ElectronicEmissionsPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 24:
            newPdu = new dis.DesignatorPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 25:
            newPdu = new dis.TransmitterPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 26:
            newPdu = new dis.SignalPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 27:
            newPdu = new dis.ReceiverPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 29:
            newPdu = new dis.UaPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 31:
            newPdu = new dis.IntercomSignalPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 32:
            newPdu = new dis.IntercomControlPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 36:
            newPdu = new dis.IsPartOfPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 37:
            newPdu = new dis.MinefieldStatePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 40:
            newPdu = new dis.MinefieldResponseNackPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 41:
            newPdu = new dis.PointObjectStatePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 43:
            newPdu = new dis.PointObjectStatePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 45:
            newPdu = new dis.ArealObjectStatePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 51:
            newPdu = new dis.CreateEntityReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 52:
            newPdu = new dis.RemoveEntityReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 54:
            newPdu = new dis.StopFreezeReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 55:
            newPdu = new dis.AcknowledgeReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 56:
            newPdu = new dis.ActionRequestReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 57:
            newPdu = new dis.ActionResponseReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 58:
            newPdu = new dis.DataQueryReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 59:
            newPdu = new dis.SetDataReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 60:
            newPdu = new dis.DataReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 61:
            newPdu = new dis.EventReportReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 62:
            newPdu = new dis.CommentReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 63:
            newPdu = new dis.RecordQueryReliablePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 66:
            newPdu = new dis.CollisionElasticPdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 67:
            newPdu = new dis.EntityStateUpdatePdu;
            newPdu.initFromBinary(inputStream);
            break;
        case 69:
            newPdu = new dis.EntityDamageStatusPdu;
            newPdu.initFromBinary(inputStream);
            break;
        default:
            throw  "PduType: " + pduType + " Unrecognized PDUType. Add PDU in dis.PduFactory.";
     }
     return newPdu;
 };

 dis.PduFactory.prototype.getPdusFromBundle = function(data)
 {
 }


exports.PduFactory = dis.PduFactory;
