import { promisify } from "node:util";
import { describe, it, beforeEach, afterEach } from "node:test";
import { use } from "chai";
import { Socket } from "socket.io-client";

globalThis.describe = describe;
globalThis.it = it;
globalThis.beforeEach = beforeEach;
globalThis.afterEach = afterEach;

Socket.prototype.emitAsync = promisify(Socket.prototype.emit);

// https://github.com/mysticatea/eslint-plugin-node/issues/250
use((await import("chai-as-promised")).default); // eslint-disable-line unicorn/no-await-expression-member
use((await import("dirty-chai")).default); // eslint-disable-line unicorn/no-await-expression-member
