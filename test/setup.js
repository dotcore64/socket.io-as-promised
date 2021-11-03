import { promisify } from 'util';
import { use } from 'chai';
import { Socket } from 'socket.io-client';

Socket.prototype.emitAsync = promisify(Socket.prototype.emit);

// https://github.com/mysticatea/eslint-plugin-node/issues/250
use((await import('chai-as-promised')).default); // eslint-disable-line node/no-unsupported-features/es-syntax
use((await import('dirty-chai')).default); // eslint-disable-line node/no-unsupported-features/es-syntax
