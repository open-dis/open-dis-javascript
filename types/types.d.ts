declare module "open-dis" {
    class AcknowledgePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: number;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: number;
        /**
         * type of message being acknowledged
         */
        acknowledgeFlag: number;
        /**
         * Whether or not the receiving entity was able to comply with the request
         */
        responseFlag: number;
        /**
         * Request ID that is unique
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AcknowledgeReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * ack flags
         */
        acknowledgeFlag: number;
        /**
         * response flags
         */
        responseFlag: number;
        /**
         * Request ID
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AcousticBeamData {
        /**
         * beam data length
         */
        beamDataLength: number;
        /**
         * beamIDNumber
         */
        beamIDNumber: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * fundamental data parameters
         */
        fundamentalDataParameters: AcousticBeamFundamentalParameter;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AcousticBeamFundamentalParameter {
        /**
         * parameter index
         */
        activeEmissionParameterIndex: number;
        /**
         * scan pattern
         */
        scanPattern: number;
        /**
         * beam center azimuth
         */
        beamCenterAzimuth: number;
        /**
         * azimuthal beamwidth
         */
        azimuthalBeamwidth: number;
        /**
         * beam center
         */
        beamCenterDE: number;
        /**
         * DE beamwidth (vertical beamwidth)
         */
        deBeamwidth: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AcousticEmitter {
        /**
         * the system for a particular UA emitter, and an enumeration
         */
        acousticName: number;
        /**
         * The function of the acoustic system
         */
        function: number;
        /**
         * The UA emitter identification number relative to a specific system
         */
        acousticIdNumber: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AcousticEmitterSystem {
        /**
         * This field shall specify the system for a particular UA emitter.
         */
        acousticName: number;
        /**
         * This field shall describe the function of the acoustic system.
         */
        acousticFunction: number;
        /**
         * This field shall specify the UA emitter identification number relative to a specific system. This field shall be represented by an 8-bit unsigned integer. This field allows the differentiation of multiple systems on an entity, even if in some instances two or more of the systems may be identical UA emitter types. Numbering of systems shall begin with the value 1.
         */
        acousticID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AcousticEmitterSystemData {
        /**
         * Length of emitter system data
         */
        emitterSystemDataLength: number;
        /**
         * Number of beams
         */
        numberOfBeams: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * This field shall specify the system for a particular UA emitter.
         */
        acousticEmitterSystem: AcousticEmitterSystem;
        /**
         * Represents the location wrt the entity
         */
        emitterLocation: Vector3Float;
        /**
         * For each beam in numberOfBeams, an emitter system. This is not right--the beam records need to be at the end of the PDU, rather than attached to each system.
         */
        beamRecords: AcousticBeamData[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ActionRequestPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * Request ID that is unique
         */
        requestID: EntityID;
        /**
         * identifies the action being requested
         */
        actionID: number;
        /**
         * Number of fixed datum records
         */
        numberOfFixedDatumRecords: number;
        /**
         * Number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variable length list of fixed datums
         */
        fixedDatums: FixedDatum[];
        /**
         * variable length list of variable length datums
         */
        variableDatums: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ActionRequestReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * request ID
         */
        requestID: number;
        /**
         * request ID
         */
        actionID: number;
        /**
         * Fixed datum record count
         */
        numberOfFixedDatumRecords: number;
        /**
         * variable datum record count
         */
        numberOfVariableDatumRecords: number;
        /**
         * Fixed datum records
         */
        fixedDatumRecords: FixedDatum[];
        /**
         * Variable datum records
         */
        variableDatumRecords: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ActionResponsePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * Request ID that is unique
         */
        requestID: EntityID;
        /**
         * Status of response
         */
        requestStatus: number;
        /**
         * Number of fixed datum records
         */
        numberOfFixedDatumRecords: number;
        /**
         * Number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variable length list of fixed datums
         */
        fixedDatums: FixedDatum[];
        /**
         * variable length list of variable length datums
         */
        variableDatums: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ActionResponseReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * request ID
         */
        requestID: number;
        /**
         * status of response
         */
        responseStatus: number;
        /**
         * Fixed datum record count
         */
        numberOfFixedDatumRecords: number;
        /**
         * variable datum record count
         */
        numberOfVariableDatumRecords: number;
        /**
         * Fixed datum records
         */
        fixedDatumRecords: FixedDatum[];
        /**
         * Variable datum records
         */
        variableDatumRecords: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AggregateID {
        /**
         * The site ID
         */
        site: number;
        /**
         * The application ID
         */
        application: number;
        /**
         * the aggregate ID
         */
        aggregateID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AggregateMarking {
        /**
         * The character set
         */
        characterSet: number;
        /**
         * The characters
         */
        characters: number[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AggregateStatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of aggregated entities
         */
        aggregateID: EntityID;
        /**
         * force ID
         */
        forceID: number;
        /**
         * state of aggregate
         */
        aggregateState: number;
        /**
         * entity type of the aggregated entities
         */
        aggregateType: EntityType;
        /**
         * formation of aggregated entities
         */
        formation: number;
        /**
         * marking for aggregate; first char is charset type, rest is char data
         */
        aggregateMarking: AggregateMarking;
        /**
         * dimensions of bounding box for the aggregated entities, origin at the center of mass
         */
        dimensions: Vector3Float;
        /**
         * orientation of the bounding box
         */
        orientation: Orientation;
        /**
         * center of mass of the aggregation
         */
        centerOfMass: Vector3Double;
        /**
         * velocity of aggregation
         */
        velocity: Vector3Float;
        /**
         * number of aggregates
         */
        numberOfDisAggregates: number;
        /**
         * number of entities
         */
        numberOfDisEntities: number;
        /**
         * number of silent aggregate types
         */
        numberOfSilentAggregateTypes: number;
        /**
         * number of silent entity types
         */
        numberOfSilentEntityTypes: number;
        /**
         * aggregates  list
         */
        aggregateIDList: AggregateID[];
        /**
         * entity ID list
         */
        entityIDList: EntityID[];
        /**
         * ^^^padding to put the start of the next list on a 32 bit boundary. This needs to be fixed
         */
        pad2: number;
        /**
         * silent entity types
         */
        silentAggregateSystemList: EntityType[];
        /**
         * silent entity types
         */
        silentEntitySystemList: EntityType[];
        /**
         * number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variableDatums
         */
        variableDatumList: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AggregateType {
        /**
         * Kind of entity
         */
        aggregateKind: number;
        /**
         * Domain of entity (air, surface, subsurface, space, etc)
         */
        domain: number;
        /**
         * country to which the design of the entity is attributed
         */
        country: number;
        /**
         * category of entity
         */
        category: number;
        /**
         * subcategory of entity
         */
        subcategory: number;
        /**
         * specific info based on subcategory field, sql has a reserved word for specific
         */
        specificInfo: number;
        extra: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AngularVelocityVector {
        /**
         * velocity about the x axis
         */
        x: number;
        /**
         * velocity about the y axis
         */
        y: number;
        /**
         * velocity about the z axis
         */
        z: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class AntennaLocation {
        /**
         * Location of the radiating portion of the antenna in world coordinates
         */
        antennaLocation: Vector3Double;
        /**
         * Location of the radiating portion of the antenna in entity coordinates
         */
        relativeAntennaLocation: Vector3Double;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ApaData {
        /**
         * Index of APA parameter
         */
        parameterIndex: number;
        /**
         * Index of APA parameter
         */
        parameterValue: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ArealObjectStatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object in synthetic environment
         */
        objectID: EntityID;
        /**
         * Object with which this point object is associated
         */
        referencedObjectID: EntityID;
        /**
         * unique update number of each state transition of an object
         */
        updateNumber: number;
        /**
         * force ID
         */
        forceID: number;
        /**
         * modifications enumeration
         */
        modifications: number;
        /**
         * Object type
         */
        objectType: EntityType;
        /**
         * Object appearance
         */
        objectAppearance: Chunk;
        /**
         * Number of points
         */
        numberOfPoints: number;
        /**
         * requesterID
         */
        requesterID: SimulationAddress;
        /**
         * receiver ID
         */
        receivingID: SimulationAddress;
        /**
         * location of object
         */
        objectLocation: Vector3Double[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ArticulationParameter {
        parameterTypeDesignator: number;
        changeIndicator: number;
        partAttachedTo: number;
        parameterType: number;
        parameterValue: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class BeamAntennaPattern {
        /**
         * The rotation that transformst he reference coordinate sytem     into the beam coordinate system. Either world coordinates or entity coordinates may be used as the     reference coordinate system, as specified by teh reference system field of the antenna pattern record.
         */
        beamDirection: Orientation;
        azimuthBeamwidth: number;
        elevationBeamwidth: number;
        referenceSystem: number;
        padding1: number;
        padding2: number;
        /**
         * Magnigute of the z-component in beam coordinates at some arbitrary      single point in the mainbeam      and in the far field of the antenna.
         */
        ez: number;
        /**
         * Magnigute of the x-component in beam coordinates at some arbitrary      single point in the mainbeam      and in the far field of the antenna.
         */
        ex: number;
        /**
         * THe phase angle between Ez and Ex in radians.
         */
        phase: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class BeamData {
        /**
         * Specifies the beam azimuth an elevation centers and corresponding half-angles     to describe the scan volume
         */
        beamAzimuthCenter: number;
        /**
         * Specifies the beam azimuth sweep to determine scan volume
         */
        beamAzimuthSweep: number;
        /**
         * Specifies the beam elevation center to determine scan volume
         */
        beamElevationCenter: number;
        /**
         * Specifies the beam elevation sweep to determine scan volume
         */
        beamElevationSweep: number;
        /**
         * allows receiver to synchronize its regenerated scan pattern to     that of the emmitter. Specifies the percentage of time a scan is through its pattern from its origion.
         */
        beamSweepSync: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class BurstDescriptor {
        /**
         * What munition was used in the burst
         */
        munition: EntityType;
        /**
         * type of warhead
         */
        warhead: number;
        /**
         * type of fuse used
         */
        fuse: number;
        /**
         * how many of the munition were fired
         */
        quantity: number;
        /**
         * rate at which the munition was fired
         */
        rate: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ClockTime {
        /**
         * Hours in UTC
         */
        hour: number;
        /**
         * Time past the hour
         */
        timePastHour: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class CollisionElasticPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that issued the collision PDU
         */
        issuingEntityID: EntityID;
        /**
         * ID of entity that has collided with the issuing entity ID
         */
        collidingEntityID: EntityID;
        /**
         * ID of event
         */
        collisionEventID: EventID;
        /**
         * some padding
         */
        pad: number;
        /**
         * velocity at collision
         */
        contactVelocity: Vector3Float;
        /**
         * mass of issuing entity
         */
        mass: number;
        /**
         * Location with respect to entity the issuing entity collided with
         */
        location: Vector3Float;
        /**
         * tensor values
         */
        collisionResultXX: number;
        /**
         * tensor values
         */
        collisionResultXY: number;
        /**
         * tensor values
         */
        collisionResultXZ: number;
        /**
         * tensor values
         */
        collisionResultYY: number;
        /**
         * tensor values
         */
        collisionResultYZ: number;
        /**
         * tensor values
         */
        collisionResultZZ: number;
        /**
         * This record shall represent the normal vector to the surface at the point of collision detection. The surface normal shall be represented in world coordinates.
         */
        unitSurfaceNormal: Vector3Float;
        /**
         * This field shall represent the degree to which energy is conserved in a collision
         */
        coefficientOfRestitution: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class CollisionPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that issued the collision PDU
         */
        issuingEntityID: EntityID;
        /**
         * ID of entity that has collided with the issuing entity ID
         */
        collidingEntityID: EntityID;
        /**
         * ID of event
         */
        eventID: EventID;
        /**
         * ID of event
         */
        collisionType: EventID;
        /**
         * some padding
         */
        pad: number;
        /**
         * velocity at collision
         */
        velocity: Vector3Float;
        /**
         * mass of issuing entity
         */
        mass: number;
        /**
         * Location with respect to entity the issuing entity collided with
         */
        location: Vector3Float;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class CommentPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * Number of fixed datum records
         */
        numberOfFixedDatumRecords: number;
        /**
         * Number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variable length list of fixed datums
         */
        fixedDatums: FixedDatum[];
        /**
         * variable length list of variable length datums
         */
        variableDatums: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class CommentReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * Fixed datum record count
         */
        numberOfFixedDatumRecords: number;
        /**
         * variable datum record count
         */
        numberOfVariableDatumRecords: number;
        /**
         * Fixed datum records
         */
        fixedDatumRecords: FixedDatum[];
        /**
         * Variable datum records
         */
        variableDatumRecords: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class CreateEntityPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * Identifier for the request
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class CreateEntityReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * Request ID
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DataPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * ID of request
         */
        requestID: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * Number of fixed datum records
         */
        numberOfFixedDatumRecords: number;
        /**
         * Number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variable length list of fixed datums
         */
        fixedDatums: FixedDatum[];
        /**
         * variable length list of variable length datums
         */
        variableDatums: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DataQueryPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * ID of request
         */
        requestID: number;
        /**
         * time issues between issues of Data PDUs. Zero means send once only.
         */
        timeInterval: number;
        /**
         * Number of fixed datum records
         */
        numberOfFixedDatumRecords: number;
        /**
         * Number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variable length list of fixed datums
         */
        fixedDatums: FixedDatum[];
        /**
         * variable length list of variable length datums
         */
        variableDatums: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DataQueryReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * request ID
         */
        requestID: number;
        /**
         * time interval between issuing data query PDUs
         */
        timeInterval: number;
        /**
         * Fixed datum record count
         */
        numberOfFixedDatumRecords: number;
        /**
         * variable datum record count
         */
        numberOfVariableDatumRecords: number;
        /**
         * Fixed datum records
         */
        fixedDatumRecords: FixedDatum[];
        /**
         * Variable datum records
         */
        variableDatumRecords: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DataReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * Request ID
         */
        requestID: number;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * Fixed datum record count
         */
        numberOfFixedDatumRecords: number;
        /**
         * variable datum record count
         */
        numberOfVariableDatumRecords: number;
        /**
         * Fixed datum records
         */
        fixedDatumRecords: FixedDatum[];
        /**
         * Variable datum records
         */
        variableDatumRecords: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DeadReckoningParameter {
        /**
         * enumeration of what dead reckoning algorighm to use
         */
        deadReckoningAlgorithm: number;
        /**
         * other parameters to use in the dead reckoning algorithm
         */
        otherParameters: number[];
        /**
         * Linear acceleration of the entity
         */
        entityLinearAcceleration: Vector3Float;
        /**
         * angular velocity of the entity
         */
        entityAngularVelocity: Vector3Float;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DesignatorPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity designating
         */
        designatingEntityID: EntityID;
        /**
         * This field shall specify a unique emitter database number assigned to  differentiate between otherwise similar or identical emitter beams within an emitter system.
         */
        codeName: number;
        /**
         * ID of the entity being designated
         */
        designatedEntityID: EntityID;
        /**
         * This field shall identify the designator code being used by the designating entity
         */
        designatorCode: number;
        /**
         * This field shall identify the designator output power in watts
         */
        designatorPower: number;
        /**
         * This field shall identify the designator wavelength in units of microns
         */
        designatorWavelength: number;
        /**
         * designtor spot wrt the designated entity
         */
        designatorSpotWrtDesignated: Vector3Float;
        /**
         * designtor spot wrt the designated entity
         */
        designatorSpotLocation: Vector3Float;
        /**
         * Dead reckoning algorithm
         */
        deadReckoningAlgorithm: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * padding
         */
        padding2: number;
        /**
         * linear accelleration of entity
         */
        entityLinearAcceleration: Vector3Float;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DetonationPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that shot
         */
        firingEntityID: EntityID;
        /**
         * ID of the entity that is being shot at
         */
        targetEntityID: EntityID;
        /**
         * ID of muntion that was fired
         */
        munitionID: EntityID;
        /**
         * ID firing event
         */
        eventID: EventID;
        /**
         * ID firing event
         */
        velocity: Vector3Float;
        /**
         * where the detonation is, in world coordinates
         */
        locationInWorldCoordinates: Vector3Double;
        /**
         * Describes munition used
         */
        burstDescriptor: BurstDescriptor;
        /**
         * location of the detonation or impact in the target entity's coordinate system. This information should be used for damage assessment.
         */
        locationInEntityCoordinates: Vector3Float;
        /**
         * result of the explosion
         */
        detonationResult: number;
        /**
         * How many articulation parameters we have
         */
        numberOfArticulationParameters: number;
        /**
         * padding
         */
        pad: number;
        articulationParameters: ArticulationParameter[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class DistributedEmissionsFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ElectronicEmissionBeamData {
        /**
         * This field shall specify the length of this beams data in 32 bit words
         */
        beamDataLength: number;
        /**
         * This field shall specify a unique emitter database number assigned to differentiate between otherwise similar or identical emitter beams within an emitter system.
         */
        beamIDNumber: number;
        /**
         * This field shall specify a Beam Parameter Index number that shall be used by receiving entities in conjunction with the Emitter Name field to provide a pointer to the stored database parameters required to regenerate the beam.
         */
        beamParameterIndex: number;
        /**
         * Fundamental parameter data such as frequency range, beam sweep, etc.
         */
        fundamentalParameterData: FundamentalParameterData;
        /**
         * beam function of a particular beam
         */
        beamFunction: number;
        /**
         * Number of track/jam targets
         */
        numberOfTrackJamTargets: number;
        /**
         * wheher or not the receiving simulation apps can assume all the targets in the scan pattern are being tracked/jammed
         */
        highDensityTrackJam: number;
        /**
         * padding
         */
        pad4: number;
        /**
         * identify jamming techniques used
         */
        jammingModeSequence: number;
        /**
         * variable length variablelist of track/jam targets
         */
        trackJamTargets: TrackJamTarget[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ElectronicEmissionsPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity emitting
         */
        emittingEntityID: EntityID;
        /**
         * ID of event
         */
        eventID: EventID;
        /**
         * This field shall be used to indicate if the data in the PDU represents a state update or just data that has changed since issuance of the last Electromagnetic Emission PDU [relative to the identified entity and emission system(s)].
         */
        stateUpdateIndicator: number;
        /**
         * This field shall specify the number of emission systems being described in the current PDU.
         */
        numberOfSystems: number;
        /**
         * padding
         */
        paddingForEmissionsPdu: number;
        /**
         * Electronic emmissions systems
         */
        systems: ElectronicEmissionSystemData[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ElectronicEmissionSystemData {
        /**
         * This field shall specify the length of this emitter system�s data (including beam data and its track/jam information) in 32-bit words. The length shall include the System Data Length field.
         */
        systemDataLength: number;
        /**
         * This field shall specify the number of beams being described in the current PDU for the system being described.
         */
        numberOfBeams: number;
        /**
         * padding.
         */
        emissionsPadding2: number;
        /**
         * This field shall specify information about a particular emitter system
         */
        emitterSystem: EmitterSystem;
        /**
         * Location with respect to the entity
         */
        location: Vector3Float;
        /**
         * variable length variablelist of beam data records
         */
        beamDataRecords: ElectronicEmissionBeamData[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EmitterSystem {
        /**
         * Name of the emitter, 16 bit enumeration
         */
        emitterName: number;
        /**
         * function of the emitter, 8 bit enumeration
         */
        function: number;
        /**
         * emitter ID, 8 bit enumeration
         */
        emitterIdNumber: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EntityID {
        /**
         * The site ID
         */
        site: number;
        /**
         * The application ID
         */
        application: number;
        /**
         * the entity ID
         */
        entity: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EntityInformationFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EntityManagementFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EntityStatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Unique ID for an entity that is tied to this state information
         */
        entityID: EntityID;
        /**
         * What force this entity is affiliated with, eg red, blue, neutral, etc
         */
        forceId: number;
        /**
         * How many articulation parameters are in the variable length list
         */
        numberOfArticulationParameters: number;
        /**
         * Describes the type of entity in the world
         */
        entityType: EntityType;
        alternativeEntityType: EntityType;
        /**
         * Describes the speed of the entity in the world
         */
        entityLinearVelocity: Vector3Float;
        /**
         * describes the location of the entity in the world
         */
        entityLocation: Vector3Double;
        /**
         * describes the orientation of the entity, in euler angles
         */
        entityOrientation: Orientation;
        /**
         * a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc.
         */
        entityAppearance: number;
        /**
         * parameters used for dead reckoning
         */
        deadReckoningParameters: DeadReckoningParameter;
        /**
         * characters that can be used for debugging, or to draw unique strings on the side of entities in the world
         */
        marking: Marking;
        /**
         * a series of bit flags
         */
        capabilities: number;
        /**
         * variable length list of articulation parameters
         */
        articulationParameters: ArticulationParameter[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
        /**
         * @returns 0 uniform color, 1 camouflage
         */
        getEntityAppearance_paintScheme(): number;
        /**
         * @param val - 0 uniform color, 1 camouflage
         */
        setEntityAppearance_paintScheme(val: number): void;
        /**
         * @returns 0 no mobility kill, 1 mobility kill
         */
        getEntityAppearance_mobility(): number;
        /**
         * @param val - 0 no mobility kill, 1 mobility kill
         */
        setEntityAppearance_mobility(val: number): void;
        /**
         * @returns 0 no firepower iill, 1 firepower kill
         */
        getEntityAppearance_firepower(): number;
        /**
         * @param val - 0 no firepower iill, 1 firepower kill
         */
        setEntityAppearance_firepower(val: number): void;
        /**
         * @returns 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
         */
        getEntityAppearance_damage(): number;
        /**
         * @param val - 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
         */
        setEntityAppearance_damage(val: number): void;
        /**
         * @returns 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
         */
        getEntityAppearance_smoke(): number;
        /**
         * @param val - 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
         */
        setEntityAppearance_smoke(val: number): void;
        /**
         * @returns dust cloud, 0 none 1 small 2 medium 3 large
         */
        getEntityAppearance_trailingEffects(): number;
        /**
         * @param val - dust cloud, 0 none 1 small 2 medium 3 large
         */
        setEntityAppearance_trailingEffects(val: number): void;
        /**
         * @returns 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
         */
        getEntityAppearance_hatch(): number;
        /**
         * @param val - 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
         */
        setEntityAppearance_hatch(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_headlights(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_headlights(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_tailLights(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_tailLights(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_brakeLights(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_brakeLights(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_flaming(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_flaming(val: number): void;
        /**
         * @returns 0 not raised 1 raised
         */
        getEntityAppearance_launcher(): number;
        /**
         * @param val - 0 not raised 1 raised
         */
        setEntityAppearance_launcher(val: number): void;
        /**
         * @returns 0 desert 1 winter 2 forest 3 unused
         */
        getEntityAppearance_camouflageType(): number;
        /**
         * @param val - 0 desert 1 winter 2 forest 3 unused
         */
        setEntityAppearance_camouflageType(val: number): void;
    }
    class EntityStateUpdatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * This field shall identify the entity issuing the PDU
         */
        entityID: EntityID;
        /**
         * Padding
         */
        padding1: number;
        /**
         * How many articulation parameters are in the variable length list
         */
        numberOfArticulationParameters: number;
        /**
         * Describes the speed of the entity in the world
         */
        entityLinearVelocity: Vector3Float;
        /**
         * describes the location of the entity in the world
         */
        entityLocation: Vector3Double;
        /**
         * describes the orientation of the entity, in euler angles
         */
        entityOrientation: Orientation;
        /**
         * a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc.
         */
        entityAppearance: number;
        articulationParameters: ArticulationParameter[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
        /**
         * 0 uniform color, 1 camouflage
         */
        getEntityAppearance_paintScheme(): void;
        /**
         * 0 uniform color, 1 camouflage
         */
        setEntityAppearance_paintScheme(): void;
        /**
         * 0 no mobility kill, 1 mobility kill
         */
        getEntityAppearance_mobility(): void;
        /**
         * 0 no mobility kill, 1 mobility kill
         */
        setEntityAppearance_mobility(): void;
        /**
         * 0 no firepower iill, 1 firepower kill
         */
        getEntityAppearance_firepower(): void;
        /**
         * 0 no firepower iill, 1 firepower kill
         */
        setEntityAppearance_firepower(): void;
        /**
         * 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
         */
        getEntityAppearance_damage(): void;
        /**
         * 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
         */
        setEntityAppearance_damage(): void;
        /**
         * 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
         */
        getEntityAppearance_smoke(): void;
        /**
         * 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
         */
        setEntityAppearance_smoke(): void;
        /**
         * dust cloud, 0 none 1 small 2 medium 3 large
         */
        getEntityAppearance_trailingEffects(): void;
        /**
         * dust cloud, 0 none 1 small 2 medium 3 large
         */
        setEntityAppearance_trailingEffects(): void;
        /**
         * 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
         */
        getEntityAppearance_hatch(): void;
        /**
         * 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
         */
        setEntityAppearance_hatch(): void;
        /**
         * 0 off 1 on
         */
        getEntityAppearance_headlights(): void;
        /**
         * 0 off 1 on
         */
        setEntityAppearance_headlights(): void;
        /**
         * 0 off 1 on
         */
        getEntityAppearance_tailLights(): void;
        /**
         * 0 off 1 on
         */
        setEntityAppearance_tailLights(): void;
        /**
         * 0 off 1 on
         */
        getEntityAppearance_brakeLights(): void;
        /**
         * 0 off 1 on
         */
        setEntityAppearance_brakeLights(): void;
        /**
         * 0 off 1 on
         */
        getEntityAppearance_flaming(): void;
        /**
         * 0 off 1 on
         */
        setEntityAppearance_flaming(): void;
        /**
         * 0 not raised 1 raised
         */
        getEntityAppearance_launcher(): void;
        /**
         * 0 not raised 1 raised
         */
        setEntityAppearance_launcher(): void;
        /**
         * 0 desert 1 winter 2 forest 3 unused
         */
        getEntityAppearance_camouflageType(): void;
        /**
         * 0 desert 1 winter 2 forest 3 unused
         */
        setEntityAppearance_camouflageType(): void;
    }
    class EntityType {
        /**
         * Kind of entity
         */
        entityKind: number;
        /**
         * Domain of entity (air, surface, subsurface, space, etc)
         */
        domain: number;
        /**
         * country to which the design of the entity is attributed
         */
        country: number;
        /**
         * category of entity
         */
        category: number;
        /**
         * subcategory of entity
         */
        subcategory: number;
        /**
         * specific info based on subcategory field. Renamed from specific because that is a reserved word in SQL
         */
        spec: number;
        extra: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Environment {
        /**
         * Record type
         */
        environmentType: number;
        /**
         * length, in bits
         */
        length: number;
        /**
         * Identify the sequentially numbered record index
         */
        recordIndex: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * Geometry or state record
         */
        geometry: number;
        /**
         * padding to bring the total size up to a 64 bit boundry
         */
        padding2: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EnvironmentalProcessPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Environmental process ID
         */
        environementalProcessID: EntityID;
        /**
         * Environment type
         */
        environmentType: EntityType;
        /**
         * model type
         */
        modelType: number;
        /**
         * Environment status
         */
        environmentStatus: number;
        /**
         * number of environment records
         */
        numberOfEnvironmentRecords: number;
        /**
         * PDU sequence number for the environmentla process if pdu sequencing required
         */
        sequenceNumber: number;
        /**
         * environemt records
         */
        environmentRecords: Environment[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EventID {
        /**
         * The site ID
         */
        site: number;
        /**
         * The application ID
         */
        application: number;
        /**
         * the number of the event
         */
        eventNumber: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EventReportPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * Type of event
         */
        eventType: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * Number of fixed datum records
         */
        numberOfFixedDatumRecords: number;
        /**
         * Number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variable length list of fixed datums
         */
        fixedDatums: FixedDatum[];
        /**
         * variable length list of variable length datums
         */
        variableDatums: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class EventReportReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * Event type
         */
        eventType: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * Fixed datum record count
         */
        numberOfFixedDatumRecords: number;
        /**
         * variable datum record count
         */
        numberOfVariableDatumRecords: number;
        /**
         * Fixed datum records
         */
        fixedDatumRecords: FixedDatum[];
        /**
         * Variable datum records
         */
        variableDatumRecords: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class FastEntityStatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * The site ID
         */
        site: number;
        /**
         * The application ID
         */
        application: number;
        /**
         * the entity ID
         */
        entity: number;
        /**
         * what force this entity is affiliated with, eg red, blue, neutral, etc
         */
        forceId: number;
        /**
         * How many articulation parameters are in the variable length list
         */
        numberOfArticulationParameters: number;
        /**
         * Kind of entity
         */
        entityKind: number;
        /**
         * Domain of entity (air, surface, subsurface, space, etc)
         */
        domain: number;
        /**
         * country to which the design of the entity is attributed
         */
        country: number;
        /**
         * category of entity
         */
        category: number;
        /**
         * subcategory of entity
         */
        subcategory: number;
        /**
         * specific info based on subcategory field. Name changed from specific because that is a reserved word in SQL.
         */
        specif: number;
        extra: number;
        /**
         * Kind of entity
         */
        altEntityKind: number;
        /**
         * Domain of entity (air, surface, subsurface, space, etc)
         */
        altDomain: number;
        /**
         * country to which the design of the entity is attributed
         */
        altCountry: number;
        /**
         * category of entity
         */
        altCategory: number;
        /**
         * subcategory of entity
         */
        altSubcategory: number;
        /**
         * specific info based on subcategory field
         */
        altSpecific: number;
        altExtra: number;
        /**
         * X velo
         */
        xVelocity: number;
        /**
         * y Value
         */
        yVelocity: number;
        /**
         * Z value
         */
        zVelocity: number;
        /**
         * X value
         */
        xLocation: number;
        /**
         * y Value
         */
        yLocation: number;
        /**
         * Z value
         */
        zLocation: number;
        psi: number;
        theta: number;
        phi: number;
        /**
         * a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc.
         */
        entityAppearance: number;
        /**
         * enumeration of what dead reckoning algorighm to use
         */
        deadReckoningAlgorithm: number;
        /**
         * other parameters to use in the dead reckoning algorithm
         */
        otherParameters: number[];
        /**
         * X value
         */
        xAcceleration: number;
        /**
         * y Value
         */
        yAcceleration: number;
        /**
         * Z value
         */
        zAcceleration: number;
        /**
         * X value
         */
        xAngularVelocity: number;
        /**
         * y Value
         */
        yAngularVelocity: number;
        /**
         * Z value
         */
        zAngularVelocity: number;
        /**
         * characters that can be used for debugging, or to draw unique strings on the side of entities in the world
         */
        marking: number[];
        /**
         * a series of bit flags
         */
        capabilities: number;
        /**
         * variable length list of articulation parameters
         */
        articulationParameters: ArticulationParameter[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
        /**
         * @returns 0 uniform color, 1 camouflage
         */
        getEntityAppearance_paintScheme(): number;
        /**
         * @param val - 0 uniform color, 1 camouflage
         */
        setEntityAppearance_paintScheme(val: number): void;
        /**
         * @returns 0 no mobility kill, 1 mobility kill
         */
        getEntityAppearance_mobility(): number;
        /**
         * @param val - 0 no mobility kill, 1 mobility kill
         */
        setEntityAppearance_mobility(val: number): void;
        /**
         * @returns 0 no firepower iill, 1 firepower kill
         */
        getEntityAppearance_firepower(): number;
        /**
         * @param val - 0 no firepower iill, 1 firepower kill
         */
        setEntityAppearance_firepower(val: number): void;
        /**
         * @returns 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
         */
        getEntityAppearance_damage(): number;
        /**
         * @param val - 0 no damage, 1 slight damage, 2 moderate, 3 destroyed
         */
        setEntityAppearance_damage(val: number): void;
        /**
         * @returns 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
         */
        getEntityAppearance_smoke(): number;
        /**
         * @param val - 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume
         */
        setEntityAppearance_smoke(val: number): void;
        /**
         * @param val - dust cloud, 0 none 1 small 2 medium 3 large
         */
        getEntityAppearance_trailingEffects(val: number): void;
        /**
         * @param val - dust cloud, 0 none 1 small 2 medium 3 large
         */
        setEntityAppearance_trailingEffects(val: number): void;
        /**
         * @returns 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
         */
        getEntityAppearance_hatch(): number;
        /**
         * @param val - 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible
         */
        setEntityAppearance_hatch(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_headlights(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_headlights(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_tailLights(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_tailLights(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_brakeLights(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_brakeLights(val: number): void;
        /**
         * @returns 0 off 1 on
         */
        getEntityAppearance_flaming(): number;
        /**
         * @param val - 0 off 1 on
         */
        setEntityAppearance_flaming(val: number): void;
        /**
         * @returns 0 not raised 1 raised
         */
        getEntityAppearance_launcher(): number;
        /**
         * @param val - 0 not raised 1 raised
         */
        setEntityAppearance_launcher(val: number): void;
        /**
         * @returns 0 desert 1 winter 2 forest 3 unused
         */
        getEntityAppearance_camouflageType(): number;
        /**
         * @param val - 0 desert 1 winter 2 forest 3 unused
         */
        setEntityAppearance_camouflageType(val: number): void;
    }
    class FirePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that shot
         */
        firingEntityID: EntityID;
        /**
         * ID of the entity that is being shot at
         */
        targetEntityID: EntityID;
        /**
         * ID of the munition that is being shot
         */
        munitionID: EntityID;
        /**
         * ID of event
         */
        eventID: EventID;
        fireMissionIndex: number;
        /**
         * location of the firing event
         */
        locationInWorldCoordinates: Vector3Double;
        /**
         * Describes munitions used in the firing event
         */
        burstDescriptor: BurstDescriptor;
        /**
         * Velocity of the ammunition
         */
        velocity: Vector3Float;
        /**
         * range to the target. Note the word range is a SQL reserved word.
         */
        rangeToTarget: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class FixedDatum {
        /**
         * ID of the fixed datum
         */
        fixedDatumID: number;
        /**
         * Value for the fixed datum
         */
        fixedDatumValue: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class FundamentalParameterData {
        /**
         * center frequency of the emission in hertz.
         */
        frequency: number;
        /**
         * Bandwidth of the frequencies corresponding to the fequency field.
         */
        frequencyRange: number;
        /**
         * Effective radiated power for the emission in DdBm. For a      radar noise jammer, indicates the peak of the transmitted power.
         */
        effectiveRadiatedPower: number;
        /**
         * Average repetition frequency of the emission in hertz.
         */
        pulseRepetitionFrequency: number;
        /**
         * Average pulse width  of the emission in microseconds.
         */
        pulseWidth: number;
        /**
         * Specifies the beam azimuth an elevation centers and corresponding half-angles     to describe the scan volume
         */
        beamAzimuthCenter: number;
        /**
         * Specifies the beam azimuth sweep to determine scan volume
         */
        beamAzimuthSweep: number;
        /**
         * Specifies the beam elevation center to determine scan volume
         */
        beamElevationCenter: number;
        /**
         * Specifies the beam elevation sweep to determine scan volume
         */
        beamElevationSweep: number;
        /**
         * allows receiver to synchronize its regenerated scan pattern to     that of the emmitter. Specifies the percentage of time a scan is through its pattern from its origion.
         */
        beamSweepSync: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class FundamentalParameterDataIff {
        /**
         * ERP
         */
        erp: number;
        /**
         * frequency
         */
        frequency: number;
        /**
         * pgrf
         */
        pgrf: number;
        /**
         * Pulse width
         */
        pulseWidth: number;
        /**
         * Burst length
         */
        burstLength: number;
        /**
         * Applicable modes enumeration
         */
        applicableModes: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * padding
         */
        pad3: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class GridAxisRecord {
        /**
         * type of environmental sample
         */
        sampleType: number;
        /**
         * value that describes data representation
         */
        dataRepresentation: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class GridAxisRecordRepresentation0 {
        /**
         * type of environmental sample
         */
        sampleType: number;
        /**
         * value that describes data representation
         */
        dataRepresentation: number;
        /**
         * number of bytes of environmental state data
         */
        numberOfBytes: number;
        /**
         * variable length variablelist of data parameters ^^^this is wrong--need padding as well
         */
        dataValues: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class GridAxisRecordRepresentation1 {
        /**
         * type of environmental sample
         */
        sampleType: number;
        /**
         * value that describes data representation
         */
        dataRepresentation: number;
        /**
         * constant scale factor
         */
        fieldScale: number;
        /**
         * constant offset used to scale grid data
         */
        fieldOffset: number;
        /**
         * Number of data values
         */
        numberOfValues: number;
        /**
         * variable length list of data parameters ^^^this is wrong--need padding as well
         */
        dataValues: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class GridAxisRecordRepresentation2 {
        /**
         * type of environmental sample
         */
        sampleType: number;
        /**
         * value that describes data representation
         */
        dataRepresentation: number;
        /**
         * number of values
         */
        numberOfValues: number;
        /**
         * variable length list of data parameters ^^^this is wrong--need padding as well
         */
        dataValues: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class GriddedDataPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * environmental simulation application ID
         */
        environmentalSimulationApplicationID: EntityID;
        /**
         * unique identifier for each piece of enviornmental data
         */
        fieldNumber: number;
        /**
         * sequence number for the total set of PDUS used to transmit the data
         */
        pduNumber: number;
        /**
         * Total number of PDUS used to transmit the data
         */
        pduTotal: number;
        /**
         * coordinate system of the grid
         */
        coordinateSystem: number;
        /**
         * number of grid axes for the environmental data
         */
        numberOfGridAxes: number;
        /**
         * are domain grid axes identidal to those of the priveious domain update?
         */
        constantGrid: number;
        /**
         * type of environment
         */
        environmentType: EntityType;
        /**
         * orientation of the data grid
         */
        orientation: Orientation;
        /**
         * valid time of the enviormental data sample, 64 bit unsigned int
         */
        sampleTime: number;
        /**
         * total number of all data values for all pdus for an environmental sample
         */
        totalValues: number;
        /**
         * total number of data values at each grid point.
         */
        vectorDimension: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * padding
         */
        padding2: number;
        /**
         * Grid data ^^^This is wrong
         */
        gridDataList: GridAxisRecord[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IffAtcNavAidsLayer1Pdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that is the source of the emissions
         */
        emittingEntityId: EntityID;
        /**
         * Number generated by the issuing simulation to associate realted events.
         */
        eventID: EventID;
        /**
         * Location wrt entity. There is some ambugiuity in the standard here, but this is the order it is listed in the table.
         */
        location: Vector3Float;
        /**
         * System ID information
         */
        systemID: SystemID;
        /**
         * padding
         */
        pad2: number;
        /**
         * fundamental parameters
         */
        fundamentalParameters: IffFundamentalData;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IffAtcNavAidsLayer2Pdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that is the source of the emissions
         */
        emittingEntityId: EntityID;
        /**
         * Number generated by the issuing simulation to associate realted events.
         */
        eventID: EventID;
        /**
         * Location wrt entity. There is some ambugiuity in the standard here, but this is the order it is listed in the table.
         */
        location: Vector3Float;
        /**
         * System ID information
         */
        systemID: SystemID;
        /**
         * padding
         */
        pad2: number;
        /**
         * fundamental parameters
         */
        fundamentalParameters: IffFundamentalData;
        /**
         * layer header
         */
        layerHeader: LayerHeader;
        /**
         * beam data
         */
        beamData: BeamData;
        /**
         * Secondary operational data, 5.2.57
         */
        secondaryOperationalData: BeamData;
        /**
         * variable length list of fundamental parameters. ^^^This is wrong
         */
        fundamentalIffParameters: FundamentalParameterDataIff[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IffFundamentalData {
        /**
         * system status
         */
        systemStatus: number;
        /**
         * Alternate parameter 4
         */
        alternateParameter4: number;
        /**
         * eight boolean fields
         */
        informationLayers: number;
        /**
         * enumeration
         */
        modifier: number;
        /**
         * parameter, enumeration
         */
        parameter1: number;
        /**
         * parameter, enumeration
         */
        parameter2: number;
        /**
         * parameter, enumeration
         */
        parameter3: number;
        /**
         * parameter, enumeration
         */
        parameter4: number;
        /**
         * parameter, enumeration
         */
        parameter5: number;
        /**
         * parameter, enumeration
         */
        parameter6: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IntercomCommunicationsParameters {
        /**
         * Type of intercom parameters record
         */
        recordType: number;
        /**
         * length of record-specifid field, in octets
         */
        recordLength: number;
        /**
         * variable length variablelist of data parameters
         */
        parameterValues: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IntercomControlPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * control type
         */
        controlType: number;
        /**
         * control type
         */
        communicationsChannelType: number;
        /**
         * Source entity ID
         */
        sourceEntityID: EntityID;
        /**
         * The specific intercom device being simulated within an entity.
         */
        sourceCommunicationsDeviceID: number;
        /**
         * Line number to which the intercom control refers
         */
        sourceLineID: number;
        /**
         * priority of this message relative to transmissons from other intercom devices
         */
        transmitPriority: number;
        /**
         * current transmit state of the line
         */
        transmitLineState: number;
        /**
         * detailed type requested.
         */
        command: number;
        /**
         * eid of the entity that has created this intercom channel.
         */
        masterEntityID: number;
        /**
         * specific intercom device that has created this intercom channel
         */
        masterCommunicationsDeviceID: number;
        /**
         * number of intercom parameters
         */
        intercomParametersLength: number;
        /**
         * Must be
         */
        intercomParameters: IntercomCommunicationsParameters[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IntercomSignalPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entitythat is the source of the communication
         */
        entityId: EntityID;
        /**
         * particular radio within an entity
         */
        communicationsDeviceID: number;
        /**
         * encoding scheme
         */
        encodingScheme: number;
        /**
         * tactical data link type
         */
        tdlType: number;
        /**
         * sample rate
         */
        sampleRate: number;
        /**
         * data length, in bits
         */
        dataLength: number;
        /**
         * samples
         */
        samples: number;
        /**
         * data bytes
         */
        data: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IsGroupOfPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of aggregated entities
         */
        groupEntityID: EntityID;
        /**
         * type of entities constituting the group
         */
        groupedEntityCategory: number;
        /**
         * Number of individual entities constituting the group
         */
        numberOfGroupedEntities: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * latitude
         */
        latitude: number;
        /**
         * longitude
         */
        longitude: number;
        /**
         * GED records about each individual entity in the group. ^^^this is wrong--need a database lookup to find the actual size of the list elements
         */
        groupedEntityDescriptions: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class IsPartOfPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of entity originating PDU
         */
        orginatingEntityID: EntityID;
        /**
         * ID of entity receiving PDU
         */
        receivingEntityID: EntityID;
        /**
         * relationship of joined parts
         */
        relationship: Relationship;
        /**
         * location of part; centroid of part in host's coordinate system. x=range, y=bearing, z=0
         */
        partLocation: Vector3Float;
        /**
         * named location
         */
        namedLocationID: NamedLocation;
        /**
         * entity type
         */
        partEntityType: EntityType;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class LayerHeader {
        /**
         * Layer number
         */
        layerNumber: number;
        /**
         * Layer speccific information enumeration
         */
        layerSpecificInformaiton: number;
        /**
         * information length
         */
        length: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class LinearObjectStatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object in synthetic environment
         */
        objectID: EntityID;
        /**
         * Object with which this point object is associated
         */
        referencedObjectID: EntityID;
        /**
         * unique update number of each state transition of an object
         */
        updateNumber: number;
        /**
         * force ID
         */
        forceID: number;
        /**
         * number of linear segment parameters
         */
        numberOfSegments: number;
        /**
         * requesterID
         */
        requesterID: SimulationAddress;
        /**
         * receiver ID
         */
        receivingID: SimulationAddress;
        /**
         * Object type
         */
        objectType: EntityType;
        /**
         * Linear segment parameters
         */
        linearSegmentParameters: LinearSegmentParameter[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class LinearSegmentParameter {
        /**
         * number of segments
         */
        segmentNumber: number;
        /**
         * segment appearance
         */
        segmentAppearance: SixByteChunk;
        /**
         * location
         */
        location: Vector3Double;
        /**
         * orientation
         */
        orientation: Orientation;
        /**
         * segmentLength
         */
        segmentLength: number;
        /**
         * segmentWidth
         */
        segmentWidth: number;
        /**
         * segmentHeight
         */
        segmentHeight: number;
        /**
         * segment Depth
         */
        segmentDepth: number;
        /**
         * segment Depth
         */
        pad1: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class LogisticsFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Marking {
        /**
         * The character set
         */
        characterSet: number;
        /**
         * The characters
         */
        characters: number[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
        /**
         * Returns the byte array marking, in string format.
         * @returns string format marking characters
         */
        getMarking(): string;
        /**
         * Given a string format marking, sets the bytes of the marking object
        to the appropriate character values. Clamps the string to no more
        than 11 characters.
         * @param newMarking - string format marking
         */
        setMarking(newMarking: string): void;
    }
    class MinefieldDataPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Minefield ID
         */
        minefieldID: EntityID;
        /**
         * ID of entity making request
         */
        requestingEntityID: EntityID;
        /**
         * Minefield sequence number
         */
        minefieldSequenceNumbeer: number;
        /**
         * request ID
         */
        requestID: number;
        /**
         * pdu sequence number
         */
        pduSequenceNumber: number;
        /**
         * number of pdus in response
         */
        numberOfPdus: number;
        /**
         * how many mines are in this PDU
         */
        numberOfMinesInThisPdu: number;
        /**
         * how many sensor type are in this PDU
         */
        numberOfSensorTypes: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * 32 boolean fields
         */
        dataFilter: number;
        /**
         * Mine type
         */
        mineType: EntityType;
        /**
         * Sensor types, each 16 bits long
         */
        sensorTypes: Chunk[];
        /**
         * Padding to get things 32-bit aligned. ^^^this is wrong--dyanmically sized padding needed
         */
        pad3: number;
        /**
         * Mine locations
         */
        mineLocation: Vector3Float[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class MinefieldFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class MinefieldQueryPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Minefield ID
         */
        minefieldID: EntityID;
        /**
         * EID of entity making the request
         */
        requestingEntityID: EntityID;
        /**
         * request ID
         */
        requestID: number;
        /**
         * Number of perimeter points for the minefield
         */
        numberOfPerimeterPoints: number;
        /**
         * Padding
         */
        pad2: number;
        /**
         * Number of sensor types
         */
        numberOfSensorTypes: number;
        /**
         * data filter, 32 boolean fields
         */
        dataFilter: number;
        /**
         * Entity type of mine being requested
         */
        requestedMineType: EntityType;
        /**
         * perimeter points of request
         */
        requestedPerimeterPoints: Point[];
        /**
         * Sensor types, each 16 bits long
         */
        sensorTypes: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class MinefieldResponseNackPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Minefield ID
         */
        minefieldID: EntityID;
        /**
         * entity ID making the request
         */
        requestingEntityID: EntityID;
        /**
         * request ID
         */
        requestID: number;
        /**
         * how many pdus were missing
         */
        numberOfMissingPdus: number;
        /**
         * PDU sequence numbers that were missing
         */
        missingPduSequenceNumbers: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class MinefieldStatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Minefield ID
         */
        minefieldID: EntityID;
        /**
         * Minefield sequence
         */
        minefieldSequence: number;
        /**
         * force ID
         */
        forceID: number;
        /**
         * Number of permieter points
         */
        numberOfPerimeterPoints: number;
        /**
         * type of minefield
         */
        minefieldType: EntityType;
        /**
         * how many mine types
         */
        numberOfMineTypes: number;
        /**
         * location of minefield in world coords
         */
        minefieldLocation: Vector3Double;
        /**
         * orientation of minefield
         */
        minefieldOrientation: Orientation;
        /**
         * appearance bitflags
         */
        appearance: number;
        /**
         * protocolMode
         */
        protocolMode: number;
        /**
         * perimeter points for the minefield
         */
        perimeterPoints: Point[];
        /**
         * Type of mines
         */
        mineType: EntityType[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ModulationType {
        /**
         * spread spectrum, 16 bit boolean array
         */
        spreadSpectrum: number;
        /**
         * major
         */
        major: number;
        /**
         * detail
         */
        detail: number;
        /**
         * system
         */
        system: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class NamedLocation {
        /**
         * station name enumeration
         */
        stationName: number;
        /**
         * station number
         */
        stationNumber: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ObjectType {
        /**
         * Kind of entity
         */
        entityKind: number;
        /**
         * Domain of entity (air, surface, subsurface, space, etc)
         */
        domain: number;
        /**
         * country to which the design of the entity is attributed
         */
        country: number;
        /**
         * category of entity
         */
        category: number;
        /**
         * subcategory of entity
         */
        subcategory: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Orientation {
        psi: number;
        theta: number;
        phi: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Pdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class PduContainer {
        /**
         * Number of PDUs in the container list
         */
        numberOfPdus: number;
        /**
         * List of PDUs
         */
        pdus: Pdu[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class PduStream {
        /**
         * short description of this PDU stream
         */
        shortDescription: number[];
        /**
         * Longish description of this PDU stream
         */
        longDescription: number[];
        /**
         * Name of person performing recording
         */
        personRecording: number[];
        /**
         * Email of person performing recording
         */
        authorEmail: number[];
        /**
         * Start time of recording, in Unix time
         */
        startTime: number;
        /**
         * stop time of recording, in Unix time
         */
        stopTime: number;
        /**
         * how many PDUs in this stream
         */
        pduCount: number;
        /**
         * variable length list of PDUs
         */
        pdusInStream: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Point {
        /**
         * x
         */
        x: number;
        /**
         * y
         */
        y: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class PointObjectStatePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object in synthetic environment
         */
        objectID: EntityID;
        /**
         * Object with which this point object is associated
         */
        referencedObjectID: EntityID;
        /**
         * unique update number of each state transition of an object
         */
        updateNumber: number;
        /**
         * force ID
         */
        forceID: number;
        /**
         * modifications
         */
        modifications: number;
        /**
         * Object type
         */
        objectType: EntityType;
        /**
         * Object location
         */
        objectLocation: Vector3Double;
        /**
         * Object orientation
         */
        objectOrientation: Orientation;
        /**
         * Object apperance
         */
        objectAppearance: number;
        /**
         * requesterID
         */
        requesterID: SimulationAddress;
        /**
         * receiver ID
         */
        receivingID: SimulationAddress;
        /**
         * padding
         */
        pad2: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class PropulsionSystemData {
        /**
         * powerSetting
         */
        powerSetting: number;
        /**
         * engine RPMs
         */
        engineRpm: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RadioCommunicationsFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RadioEntityType {
        /**
         * Kind of entity
         */
        entityKind: number;
        /**
         * Domain of entity (air, surface, subsurface, space, etc)
         */
        domain: number;
        /**
         * country to which the design of the entity is attributed
         */
        country: number;
        /**
         * category of entity
         */
        category: number;
        /**
         * specific info based on subcategory field
         */
        nomenclatureVersion: number;
        nomenclature: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ReceiverPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that is the source of the communication, ie contains the radio
         */
        entityId: EntityID;
        /**
         * particular radio within an entity
         */
        radioId: number;
        /**
         * encoding scheme used, and enumeration
         */
        receiverState: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * received power
         */
        receivedPower: number;
        /**
         * ID of transmitter
         */
        transmitterEntityId: EntityID;
        /**
         * ID of transmitting radio
         */
        transmitterRadioId: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RecordQueryReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * request ID
         */
        requestID: number;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding. The spec is unclear and contradictory here.
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * event type
         */
        eventType: number;
        /**
         * time
         */
        time: number;
        /**
         * numberOfRecords
         */
        numberOfRecords: number;
        /**
         * record IDs
         */
        recordIDs: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RecordSet {
        /**
         * record ID
         */
        recordID: number;
        /**
         * record set serial number
         */
        recordSetSerialNumber: number;
        /**
         * record length
         */
        recordLength: number;
        /**
         * record count
         */
        recordCount: number;
        /**
         * ^^^This is wrong--variable sized data records
         */
        recordValues: number;
        /**
         * ^^^This is wrong--variable sized padding
         */
        pad4: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Relationship {
        /**
         * Nature of join
         */
        nature: number;
        /**
         * position of join
         */
        position: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RemoveEntityPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * Identifier for the request
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RemoveEntityReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * Request ID
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RepairCompletePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is receiving service
         */
        receivingEntityID: EntityID;
        /**
         * Entity that is supplying
         */
        repairingEntityID: EntityID;
        /**
         * Enumeration for type of repair
         */
        repair: number;
        /**
         * padding, number prevents conflict with superclass ivar name
         */
        padding2: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class RepairResponsePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is receiving service
         */
        receivingEntityID: EntityID;
        /**
         * Entity that is supplying
         */
        repairingEntityID: EntityID;
        /**
         * Result of repair operation
         */
        repairResult: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * padding
         */
        padding2: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ResupplyCancelPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is receiving service
         */
        receivingEntityID: EntityID;
        /**
         * Entity that is supplying
         */
        supplyingEntityID: EntityID;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ResupplyOfferPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is receiving service
         */
        receivingEntityID: EntityID;
        /**
         * Entity that is supplying
         */
        supplyingEntityID: EntityID;
        /**
         * how many supplies are being offered
         */
        numberOfSupplyTypes: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * padding
         */
        padding2: number;
        supplies: SupplyQuantity[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ResupplyReceivedPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is receiving service
         */
        receivingEntityID: EntityID;
        /**
         * Entity that is supplying
         */
        supplyingEntityID: EntityID;
        /**
         * how many supplies are being offered
         */
        numberOfSupplyTypes: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * padding
         */
        padding2: number;
        supplies: SupplyQuantity[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SeesPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Originating entity ID
         */
        orginatingEntityID: EntityID;
        /**
         * IR Signature representation index
         */
        infraredSignatureRepresentationIndex: number;
        /**
         * acoustic Signature representation index
         */
        acousticSignatureRepresentationIndex: number;
        /**
         * radar cross section representation index
         */
        radarCrossSectionSignatureRepresentationIndex: number;
        /**
         * how many propulsion systems
         */
        numberOfPropulsionSystems: number;
        /**
         * how many vectoring nozzle systems
         */
        numberOfVectoringNozzleSystems: number;
        /**
         * variable length list of propulsion system data
         */
        propulsionSystemData: PropulsionSystemData[];
        /**
         * variable length list of vectoring system data
         */
        vectoringSystemData: VectoringNozzleSystemData[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ServiceRequestPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is requesting service
         */
        requestingEntityID: EntityID;
        /**
         * Entity that is providing the service
         */
        servicingEntityID: EntityID;
        /**
         * type of service requested
         */
        serviceTypeRequested: number;
        /**
         * How many requested
         */
        numberOfSupplyTypes: number;
        /**
         * padding
         */
        serviceRequestPadding: number;
        supplies: SupplyQuantity[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SetDataPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * ID of request
         */
        requestID: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * Number of fixed datum records
         */
        numberOfFixedDatumRecords: number;
        /**
         * Number of variable datum records
         */
        numberOfVariableDatumRecords: number;
        /**
         * variable length list of fixed datums
         */
        fixedDatums: FixedDatum[];
        /**
         * variable length list of variable length datums
         */
        variableDatums: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SetDataReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * Request ID
         */
        requestID: number;
        /**
         * Fixed datum record count
         */
        numberOfFixedDatumRecords: number;
        /**
         * variable datum record count
         */
        numberOfVariableDatumRecords: number;
        /**
         * Fixed datum records
         */
        fixedDatumRecords: FixedDatum[];
        /**
         * Variable datum records
         */
        variableDatumRecords: VariableDatum[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SetRecordReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * request ID
         */
        requestID: number;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding. The spec is unclear and contradictory here.
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * Number of record sets in list
         */
        numberOfRecordSets: number;
        /**
         * record sets
         */
        recordSets: RecordSet[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class ShaftRPMs {
        /**
         * Current shaft RPMs
         */
        currentShaftRPMs: number;
        /**
         * ordered shaft rpms
         */
        orderedShaftRPMs: number;
        /**
         * rate of change of shaft RPMs
         */
        shaftRPMRateOfChange: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SignalPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that is the source of the communication, ie contains the radio
         */
        entityId: EntityID;
        /**
         * particular radio within an entity
         */
        radioId: number;
        /**
         * encoding scheme used, and enumeration
         */
        encodingScheme: number;
        /**
         * tdl type
         */
        tdlType: number;
        /**
         * sample rate
         */
        sampleRate: number;
        /**
         * length of data, in bits
         */
        dataLength: number;
        /**
         * number of samples. If the PDU contains encoded audio, this should be zero.
         */
        samples: number;
        /**
         * list of eight bit values. Must be padded to fall on a 32 bit boundary.
         */
        data: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SimulationAddress {
        /**
         * The site ID
         */
        site: number;
        /**
         * The application ID
         */
        application: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SimulationManagementFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SimulationManagementWithReliabilityFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SixByteChunk {
        /**
         * six bytes of arbitrary data
         */
        otherParameters: number[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SphericalHarmonicAntennaPattern {
        harmonicOrder: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class StartResumePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * UTC time at which the simulation shall start or resume
         */
        realWorldTime: ClockTime;
        /**
         * Simulation clock time at which the simulation shall start or resume
         */
        simulationTime: ClockTime;
        /**
         * Identifier for the request
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class StartResumeReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * time in real world for this operation to happen
         */
        realWorldTime: ClockTime;
        /**
         * time in simulation for the simulation to resume
         */
        simulationTime: ClockTime;
        /**
         * level of reliability service used for this transaction
         */
        requiredReliabilityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * padding
         */
        pad2: number;
        /**
         * Request ID
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class StopFreezePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Entity that is sending message
         */
        originatingEntityID: EntityID;
        /**
         * Entity that is intended to receive message
         */
        receivingEntityID: EntityID;
        /**
         * UTC time at which the simulation shall stop or freeze
         */
        realWorldTime: ClockTime;
        /**
         * Reason the simulation was stopped or frozen
         */
        reason: number;
        /**
         * Internal behavior of the simulation and its appearance while frozento the other participants
         */
        frozenBehavior: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * Request ID that is unique
         */
        requestID: EntityID;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class StopFreezeReliablePdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * Object originatig the request
         */
        originatingEntityID: EntityID;
        /**
         * Object with which this point object is associated
         */
        receivingEntityID: EntityID;
        /**
         * time in real world for this operation to happen
         */
        realWorldTime: ClockTime;
        /**
         * Reason for stopping/freezing simulation
         */
        reason: number;
        /**
         * internal behvior of the simulation while frozen
         */
        frozenBehavior: number;
        /**
         * reliablity level
         */
        requiredReliablityService: number;
        /**
         * padding
         */
        pad1: number;
        /**
         * Request ID
         */
        requestID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SupplyQuantity {
        /**
         * Type of supply
         */
        supplyType: EntityType;
        /**
         * quantity to be supplied
         */
        quantity: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SyntheticEnvironmentFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class SystemID {
        /**
         * System Type
         */
        systemType: number;
        /**
         * System name, an enumeration
         */
        systemName: number;
        /**
         * System mode
         */
        systemMode: number;
        /**
         * Change Options
         */
        changeOptions: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class TrackJamTarget {
        /**
         * track/jam target
         */
        trackJam: EntityID;
        /**
         * Emitter ID
         */
        emitterID: number;
        /**
         * beam ID
         */
        beamID: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class TransferControlRequestPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of entity originating request
         */
        orginatingEntityID: EntityID;
        /**
         * ID of entity receiving request
         */
        recevingEntityID: EntityID;
        /**
         * ID ofrequest
         */
        requestID: number;
        /**
         * required level of reliabliity service.
         */
        requiredReliabilityService: number;
        /**
         * type of transfer desired
         */
        tranferType: number;
        /**
         * The entity for which control is being requested to transfer
         */
        transferEntityID: EntityID;
        /**
         * number of record sets to transfer
         */
        numberOfRecordSets: number;
        /**
         * ^^^This is wrong--the RecordSet class needs more work
         */
        recordSets: RecordSet[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class TransmitterPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that is the source of the communication, ie contains the radio
         */
        entityId: EntityID;
        /**
         * particular radio within an entity
         */
        radioId: number;
        /**
         * linear accelleration of entity
         */
        radioEntityType: RadioEntityType;
        /**
         * transmit state
         */
        transmitState: number;
        /**
         * input source
         */
        inputSource: number;
        /**
         * padding
         */
        padding1: number;
        /**
         * Location of antenna
         */
        antennaLocation: Vector3Double;
        /**
         * relative location of antenna, in entity coordinates
         */
        relativeAntennaLocation: Vector3Float;
        /**
         * antenna pattern type
         */
        antennaPatternType: number;
        /**
         * atenna pattern length
         */
        antennaPatternCount: number;
        /**
         * frequency
         */
        frequency: number;
        /**
         * transmit frequency Bandwidth
         */
        transmitFrequencyBandwidth: number;
        /**
         * transmission power
         */
        power: number;
        /**
         * modulation
         */
        modulationType: ModulationType;
        /**
         * crypto system enumeration
         */
        cryptoSystem: number;
        /**
         * crypto system key identifer
         */
        cryptoKeyId: number;
        /**
         * how many modulation parameters we have
         */
        modulationParameterCount: number;
        /**
         * padding2
         */
        padding2: number;
        /**
         * padding3
         */
        padding3: number;
        /**
         * variable length list of modulation parameters
         */
        modulationParametersList: ModulationType[];
        /**
         * variable length list of antenna pattern records
         */
        antennaPatternList: BeamAntennaPattern[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class UaPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that is the source of the emission
         */
        emittingEntityID: EntityID;
        /**
         * ID of event
         */
        eventID: EventID;
        /**
         * This field shall be used to indicate whether the data in the UA PDU represent a state update or data that have changed since issuance of the last UA PDU
         */
        stateChangeIndicator: number;
        /**
         * padding
         */
        pad: number;
        /**
         * This field indicates which database record (or file) shall be used in the definition of passive signature (unintentional) emissions of the entity. The indicated database record (or  file) shall define all noise generated as a function of propulsion plant configurations and associated  auxiliaries.
         */
        passiveParameterIndex: number;
        /**
         * This field shall specify the entity propulsion plant configuration. This field is used to determine the passive signature characteristics of an entity.
         */
        propulsionPlantConfiguration: number;
        /**
         * This field shall represent the number of shafts on a platform
         */
        numberOfShafts: number;
        /**
         * This field shall indicate the number of APAs described in the current UA PDU
         */
        numberOfAPAs: number;
        /**
         * This field shall specify the number of UA emitter systems being described in the current UA PDU
         */
        numberOfUAEmitterSystems: number;
        /**
         * shaft RPM values
         */
        shaftRPMs: ShaftRPMs[];
        /**
         * apaData
         */
        apaData: ApaData[];
        emitterSystems: AcousticEmitterSystemData[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class UnsignedIntegerWrapper {
        /**
         * name can't be too accurate or the generated source code will have reserved word problems
         */
        wrapper: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class VariableDatum {
        /**
         * ID of the variable datum
         */
        variableDatumID: number;
        /**
         * length of the variable datums, in bits. Note that this is not programmatically tied to the size of the variableData. The variable data field may be 64 bits long but only 16 bits of it could actually be used.
         */
        variableDatumLength: number;
        /**
         * data can be any length, but must increase in 8 byte quanta. This requires some postprocessing patches. Note that setting the data allocates a new internal array to account for the possibly increased size. The default initial size is 64 bits.
         */
        variableDatumData: Chunk[];
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Vector3Double {
        /**
         * X value
         */
        x: number;
        /**
         * Y value
         */
        y: number;
        /**
         * Z value
         */
        z: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class Vector3Float {
        /**
         * X value
         */
        x: number;
        /**
         * y Value
         */
        y: number;
        /**
         * Z value
         */
        z: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class VectoringNozzleSystemData {
        /**
         * horizontal deflection angle
         */
        horizontalDeflectionAngle: number;
        /**
         * vertical deflection angle
         */
        verticalDeflectionAngle: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class WarfareFamilyPdu {
        /**
         * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
         */
        protocolVersion: number;
        /**
         * Exercise ID
         */
        exerciseID: number;
        /**
         * Type of pdu, unique for each PDU class
         */
        pduType: number;
        /**
         * value that refers to the protocol family, eg SimulationManagement, et
         */
        protocolFamily: number;
        /**
         * Timestamp value
         */
        timestamp: number;
        /**
         * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
         */
        pduLength: number;
        /**
         * zero-filled array of padding
         */
        padding: number;
        /**
         * ID of the entity that shot
         */
        firingEntityID: EntityID;
        /**
         * ID of the entity that is being shot at
         */
        targetEntityID: EntityID;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    /**
     * Replaces (n)ByteChunk functions
     * @example
     * var foo = new Chunk(4) // for a 4 byte chunk
     * @param chunkSize - specify the size of the chunk, ie 1 = 1 byte chunk, 8 = 8 byte chunk, etc.
     */
    class Chunk {
        constructor(chunkSize: number);
        data: number[];
        chunkSize: number;
        isSigned: number;
        initFromBinary(inputStream: InputStream): void;
        encodeToBinary(outputStream: OutputStream): void;
    }
    class CoordinateConversion {
        RADIANS_TO_DEGREES: number;
        DEGREES_TO_RADIANS: number;
        /**
         * semi major axis (WGS 84)
         */
        a: number;
        /**
         * semi minor axis (WGS 84)
         */
        b: number;
        /**
         * Converts DIS xyz world coordinates to latitude and longitude (IN DEGREES). This algorithm may not be 100% accurate
        near the poles. Uses WGS84 , though you can change the ellipsoid constants a and b if you want to use something
        else. These formulas were obtained from Military Handbook 600008. The code itself has been
        translated from C to Java to Javascript over the years, so hold onto your hats.
         */
        convertDisToLatLongInDegrees(position: Vector3Float): LatLonAlt;
        /**
         * Converts lat long and geodetic height (elevation) into DIS XYZ
        This algorithm also uses the WGS84 ellipsoid, though you can change the values
        of a and b for a different ellipsoid. Adapted from Military Handbook 600008
         * @param latLonAlt - in degrees and meters
         * @returns in meters
         */
        getXYZfromLatLonAltDegrees(latLonAlt: LatLonAltShort): Vector3Float;
    }
    /**
     * Constructor. Takes the integer value extracted from the DIS Entity State Field appearance
     * @param integerValue - the entity appearance from the espdu
     */
    class DisAppearance {
        constructor(integerValue: number);
        entityAppearance: number;
        /**
         * Test code for creating the correct bitmask
         */
        getTestMask(): number;
        getBitField(startPosition: number, finishPosition: number): number;
        /**
         * Set the "bit" position in a number to 1
         * @param num - the number whose bit we are setting. Typically zero.
         * @param bit - which bit to set
         * @returns the number passed in, with the "bit"th bit flipped on.
         */
        bit_set(num: number, bit: number): number;
    }
    class InputStream {
        constructor(binaryData: ArrayBuffer);
        /**
         * data, byte offset
         */
        dataView: DataView;
        /**
         * ptr to "current" position in array
         */
        currentPosition: number;
        readUByte(): number;
        readByte(): number;
        readUShort(): number;
        readShort(): number;
        readUInt(): number;
        readInt(): number;
        /**
         * Read a long integer. Assumes big endian format. Uses the BigInteger package.
         */
        readLongInt(): number;
        readFloat32(): number;
        readFloat64(): number;
        readLong(): string;
    }
    type LatLonAlt = {
        latitude: number;
        longitude: number;
        altitude: number;
    };
    /**
     * Unfortunate re-typing of original LatLonAlt because one function
    in CoordinateConversion uses different variable names.
    
    TODO: Remove when getXYZfromLatLonAltDegrees uses LatLonAlt.
     */
    type LatLonAltShort = {
        lat: number;
        lon: number;
        alt: number;
    };
    class OutputStream {
        constructor(binaryDataBuffer: ArrayBuffer);
        binaryData: ArrayBuffer;
        /**
         * data, byte offset
         */
        dataView: DataView;
        /**
         * ptr to current position in array
         */
        currentPosition: number;
        /**
         * Returns a byte array trimmed to the maximum number of bytes written
        to the stream. Eg, if we initialize with a 500 byte bufer, and we
        only write 10 bytes to the output stream, this will return the first
        ten bytes of the array.
         * @returns Only the data written
         */
        toByteArray(): ArrayBuffer;
        writeUByte(userData: number): void;
        writeByte(userData: number): void;
        writeUShort(userData: number): void;
        writeShort(userData: number): void;
        writeUInt(userData: number): void;
        writeInt(userData: number): void;
        writeFloat32(userData: number): void;
        writeFloat64(userData: number): void;
        writeLong(userData: number): void;
    }
    /**
     * The PDU factory is responsible for decoding binary data and turning
    it into the appropriate type of PDU.
    
    The websocket will typically send the web page a IEEE 1278.1 binary
    array of data. It could be any one of dozens of PDUs. The start of
    all PDUs is the same--they have the same header. One of the fields in
    the header is the PduType, an 8 bit integer with a unqiue value for
    each type of PDU. We have to peak at that value, decide what type
    of PDU to create of the binary we have received, and then decode it.
     */
    class PduFactory {
        /**
         * decode incoming binary data and
        return the correct type of PDU.
         * @param data - the IEEE 1278.1 binary data
         * @returns Returns an instance of some PDU, be it espdu, fire, detonation, etc. Exception if PduType not known.
         */
        createPdu(data: ArrayBuffer): Pdu;
    }
    /**
     * Constructor, creates an object that can do coordinate systems conversions.
    Takes a geodetic point that is the origin of a tangent plane to the surface
    of the earth. This is useful for doing local simulation work. The local
    coordinate system has postive x east, positive y north, and positive Z up,
    aka an ENU coordinate system. Methods for converting from that coordinate system
    to the DIS (ECEF) coordinate system or geotetic coordinate systems are provided.
     * @param lat - latitude, in degrees, of where the local tangent plane is located
     * @param lon - longitude, in degrees, of the origin of the local tangent plane
     * @param alt - altitude, in meters, of the origin of the local tangent plane
     */
    class RangeCoordinates {
        constructor(lat: number, lon: number, alt: number);
        RADIANS_PER_DEGREE: number;
        DEGREES_PER_RADIAN: number;
        /**
         * WGS84 semimajor axis (constant)
         */
        a: number;
        /**
         * WGS84 semiminor axis (constant)
         */
        b: number;
        /**
         * Ellipsoidal Flatness (constant)
         */
        f: number;
        /**
         * Eccentricity (constant)
         */
        e: number;
        /**
         * The origin of the local, East-North-Up (ENU) coordinate system, in lat/lon degrees and meters.
         */
        ENUOrigin: LatLonAlt;
        /**
         * Find the origin of the ENU in earth-centered, earth-fixed ECEF aka DIS coordinates
         */
        ENUOriginInECEF: Vector3Float;
        /**
         * Determines N, the distance from a normal plane at the given
        latitude to the Z-axis running through the center of the earth.
        This is NOT the same as the distance to the center of the earth.
         * @param lambda - the latitude, in radians.
         * @returns distance in meters from the latitude to the axis of the earth
         */
        N(lambda: number): number;
        /**
         * Converts a latitude, longitude, and altitude object to DIS rectilinear
        coordinates, aka earth-centered, earth-fixed, rectilinear.
         * @param latLonAlt - The lat/lon/alt, in degrees and meters
         * @returns rectilienar coordinates in ECEF, aka DIS coordinates
         */
        latLonAltDegreesObjectToECEF(latLonAlt: LatLonAlt): Vector3Float;
        /**
         * Converts a latitude, longitude, and altitude to DIS rectilinear
        coordinates, aka earth-centered, earth-fixed, rectilinear.
         * @param latitude - (in radians)
         * @param longitude - (in radians)
         * @param altitude - (in meters)
         * @returns rectilienar coordinates in ECEF-r, aka DIS coordinates
         */
        latLonAltRadiansToECEF(latitude: number, longitude: number, altitude: number): Vector3Float;
        /**
         * @param latitude - in degrees
         * @param longitude - in degrees
         * @param altitude - in meters
         * @returns coordinates in ECEF, in meters aka DIS global coordinates
         */
        latLonAltDegreesToECEF(latitude: number, longitude: number, altitude: number): Vector3Float;
        /**
         * Converts DIS xyz world coordinates to latitude and longitude (IN DEGREES). This algorithm may not be 100% accurate
        near the poles. Uses WGS84 , though you can change the ellipsoid constants a and b if you want to use something
        else. These formulas were obtained from Military Handbook 600008. The code itself has been
        translated from C to Java to Javascript over the years, so hold onto your hats. (This is
        copied from other sources than those listed above. Seems to work, though.)
         */
        ECEFObjectToLatLongAltInDegrees(position: Vector3Float): LatLonAlt;
        /**
         * Converts an ECEF position to the local ENU coordinate system. Units are meters,
         and the origin of the ENU coordinate system is set in the constructor.
         * @param ecefPosition - ecef position (in meters)
         * @returns object with x, y, and z local coordinates, ENU
         */
        ECEFObjectToENU(ecefPosition: Vector3Float): Vector3Float;
        /**
         * Converts an ECEF position to the local ENU coordinate system. Units are meters,
         and the origin of the ENU coordinate system is set in the constructor.
         * @param X - the X coordinate of the ECEF position
         * @param Y - the Y coordinate
         * @param Z - the Z coordinate
         * @returns object with x, y, and z local coordinates, ENU
         */
        ECEFtoENU(X: number, Y: number, Z: number): Vector3Float;
        /**
         * Converts a local coordinate system / ENU/ Local Tangent Plane object to ECEF, aka DIS coordinates.
         * @param enuPosition - local coordinate object
         * @returns point in ECEF / DIS coordinate system
         */
        ENUObjectToECEF(enuPosition: Vector3Float): Vector3Float;
        /**
         * Converts a local coordinate system / ENU/ Local Tangent Plane point to ECEF, aka DIS coordinates.
         * @param localX - local coordinate system X
         * @param localY - local coordinate system Y
         * @param localZ - local coordinate system Z
         * @returns point in ECEF / DIS coordinate system
         */
        ENUtoECEF(localX: number, localY: number, localZ: number): Vector3Float;
    }
    /**
     * Utility class that converts between strings and the DIS ESPDU marking
    field. The marking field is 12 bytes long, with the first byte being
    the character set used, and the remaining 11 bytes character codes in
    that character set. This is often used for debugging or "billboard"
    displays in 3D; it's intended for humans. The string character values
    are clamped (or filled) to exactly 11 bytes, so "This is a long string"
    will be clamped to "This is a l" (in charachter codes) and "foo" will
    be filled to "foo\0\0\0\0\0\0\0\0".<p>
    
    It is recommended that only ASCII character set (character set = 1)
    be used.
     */
    class StringConversion {
        /**
         * Given a string, returns a DIS marking field. The character set is set to
        1, for ascii. The length is clamped to 11, and zero-filled if the string
        is shorter than 11.
         * @returns disMarking field, 12 bytes long, character set = 1 (ascii) in 0, zero-filled to 11 character codes
         */
        StringToDisMarking(markingString: string): number[];
        /**
         * Given a DIS marking field, returns a string. Assumes always ascii.
         * @param disMarking - dis marking field, [0] = character set, the rest character codes
         * @returns string equivalent of the marking field
         */
        DisMarkingToString(disMarking: number[]): string;
    }
}

