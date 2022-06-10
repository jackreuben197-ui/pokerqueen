/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.grace = (function() {

    /**
     * Namespace grace.
     * @exports grace
     * @namespace
     */
    var grace = {};

    grace.proto = (function() {

        /**
         * Namespace proto.
         * @memberof grace
         * @namespace
         */
        var proto = {};

        proto.msg = (function() {

            /**
             * Namespace msg.
             * @memberof grace.proto
             * @namespace
             */
            var msg = {};

            msg.Player = (function() {

                /**
                 * Properties of a Player.
                 * @memberof grace.proto.msg
                 * @interface IPlayer
                 * @property {number|null} [id] Player id
                 * @property {string|null} [name] Player name
                 * @property {number|Long|null} [enterTime] Player enterTime
                 */

                /**
                 * Constructs a new Player.
                 * @memberof grace.proto.msg
                 * @classdesc Represents a Player.
                 * @implements IPlayer
                 * @constructor
                 * @param {grace.proto.msg.IPlayer=} [properties] Properties to set
                 */
                function Player(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Player id.
                 * @member {number} id
                 * @memberof grace.proto.msg.Player
                 * @instance
                 */
                Player.prototype.id = 0;

                /**
                 * Player name.
                 * @member {string} name
                 * @memberof grace.proto.msg.Player
                 * @instance
                 */
                Player.prototype.name = "";

                /**
                 * Player enterTime.
                 * @member {number|Long} enterTime
                 * @memberof grace.proto.msg.Player
                 * @instance
                 */
                Player.prototype.enterTime = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

                /**
                 * Creates a new Player instance using the specified properties.
                 * @function create
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {grace.proto.msg.IPlayer=} [properties] Properties to set
                 * @returns {grace.proto.msg.Player} Player instance
                 */
                Player.create = function create(properties) {
                    return new Player(properties);
                };

                /**
                 * Encodes the specified Player message. Does not implicitly {@link grace.proto.msg.Player.verify|verify} messages.
                 * @function encode
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {grace.proto.msg.IPlayer} message Player message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Player.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                        writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.id);
                    if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.name);
                    if (message.enterTime != null && Object.hasOwnProperty.call(message, "enterTime"))
                        writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.enterTime);
                    return writer;
                };

                /**
                 * Encodes the specified Player message, length delimited. Does not implicitly {@link grace.proto.msg.Player.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {grace.proto.msg.IPlayer} message Player message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Player.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Player message from the specified reader or buffer.
                 * @function decode
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {grace.proto.msg.Player} Player
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Player.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.grace.proto.msg.Player();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.id = reader.uint32();
                            break;
                        case 2:
                            message.name = reader.string();
                            break;
                        case 3:
                            message.enterTime = reader.uint64();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Player message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {grace.proto.msg.Player} Player
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Player.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Player message.
                 * @function verify
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Player.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.id != null && message.hasOwnProperty("id"))
                        if (!$util.isInteger(message.id))
                            return "id: integer expected";
                    if (message.name != null && message.hasOwnProperty("name"))
                        if (!$util.isString(message.name))
                            return "name: string expected";
                    if (message.enterTime != null && message.hasOwnProperty("enterTime"))
                        if (!$util.isInteger(message.enterTime) && !(message.enterTime && $util.isInteger(message.enterTime.low) && $util.isInteger(message.enterTime.high)))
                            return "enterTime: integer|Long expected";
                    return null;
                };

                /**
                 * Creates a Player message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {grace.proto.msg.Player} Player
                 */
                Player.fromObject = function fromObject(object) {
                    if (object instanceof $root.grace.proto.msg.Player)
                        return object;
                    var message = new $root.grace.proto.msg.Player();
                    if (object.id != null)
                        message.id = object.id >>> 0;
                    if (object.name != null)
                        message.name = String(object.name);
                    if (object.enterTime != null)
                        if ($util.Long)
                            (message.enterTime = $util.Long.fromValue(object.enterTime)).unsigned = true;
                        else if (typeof object.enterTime === "string")
                            message.enterTime = parseInt(object.enterTime, 10);
                        else if (typeof object.enterTime === "number")
                            message.enterTime = object.enterTime;
                        else if (typeof object.enterTime === "object")
                            message.enterTime = new $util.LongBits(object.enterTime.low >>> 0, object.enterTime.high >>> 0).toNumber(true);
                    return message;
                };

                /**
                 * Creates a plain object from a Player message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof grace.proto.msg.Player
                 * @static
                 * @param {grace.proto.msg.Player} message Player
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Player.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.id = 0;
                        object.name = "";
                        if ($util.Long) {
                            var long = new $util.Long(0, 0, true);
                            object.enterTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                        } else
                            object.enterTime = options.longs === String ? "0" : 0;
                    }
                    if (message.id != null && message.hasOwnProperty("id"))
                        object.id = message.id;
                    if (message.name != null && message.hasOwnProperty("name"))
                        object.name = message.name;
                    if (message.enterTime != null && message.hasOwnProperty("enterTime"))
                        if (typeof message.enterTime === "number")
                            object.enterTime = options.longs === String ? String(message.enterTime) : message.enterTime;
                        else
                            object.enterTime = options.longs === String ? $util.Long.prototype.toString.call(message.enterTime) : options.longs === Number ? new $util.LongBits(message.enterTime.low >>> 0, message.enterTime.high >>> 0).toNumber(true) : message.enterTime;
                    return object;
                };

                /**
                 * Converts this Player to JSON.
                 * @function toJSON
                 * @memberof grace.proto.msg.Player
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Player.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Player;
            })();

            return msg;
        })();

        return proto;
    })();

    return grace;
})();

module.exports = $root;
