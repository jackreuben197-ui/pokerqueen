import * as $protobuf from "protobufjs";
/** Namespace grace. */
export namespace grace {

    /** Namespace proto. */
    namespace proto {

        /** Namespace msg. */
        namespace msg {

            /** Properties of a Player. */
            interface IPlayer {

                /** Player id */
                id?: (number|null);

                /** Player name */
                name?: (string|null);

                /** Player enterTime */
                enterTime?: (number|Long|null);
            }

            /** Represents a Player. */
            class Player implements IPlayer {

                /**
                 * Constructs a new Player.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: grace.proto.msg.IPlayer);

                /** Player id. */
                public id: number;

                /** Player name. */
                public name: string;

                /** Player enterTime. */
                public enterTime: (number|Long);

                /**
                 * Creates a new Player instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Player instance
                 */
                public static create(properties?: grace.proto.msg.IPlayer): grace.proto.msg.Player;

                /**
                 * Encodes the specified Player message. Does not implicitly {@link grace.proto.msg.Player.verify|verify} messages.
                 * @param message Player message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: grace.proto.msg.IPlayer, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Player message, length delimited. Does not implicitly {@link grace.proto.msg.Player.verify|verify} messages.
                 * @param message Player message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: grace.proto.msg.IPlayer, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Player message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Player
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): grace.proto.msg.Player;

                /**
                 * Decodes a Player message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Player
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): grace.proto.msg.Player;

                /**
                 * Verifies a Player message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Player message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Player
                 */
                public static fromObject(object: { [k: string]: any }): grace.proto.msg.Player;

                /**
                 * Creates a plain object from a Player message. Also converts values to other types if specified.
                 * @param message Player
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: grace.proto.msg.Player, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Player to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
