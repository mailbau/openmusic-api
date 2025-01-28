const Hapi = require('@hapi/hapi');
require('dotenv').config();
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

const AlbumsService = require('./services/postgres/albumsService');
const AlbumsValidator = require('./validator/albums');
const albums = require('./api/albums');

const SongsService = require('./services/postgres/songsService');
const SongsValidator = require('./validator/songs');
const songs = require('./api/songs');

const UsersService = require('./services/postgres/usersService');
const UsersValidator = require('./validator/users');
const users = require('./api/users');

const AuthenticationsService = require('./services/postgres/authenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const authentications = require('./api/authentications');

const PlaylistsService = require('./services/postgres/playlistsService');
const PlaylistsValidator = require('./validator/playlists');
const playlists = require('./api/playlists');

const CollaborationsService = require('./services/postgres/collaborationsService');
const CollaborationsValidator = require('./validator/collaborations');
const collaborations = require('./api/collaborations');

const init = async () => {
    const albumsService = new AlbumsService();
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService(usersService);
    const playlistsService = new PlaylistsService(collaborationsService, songsService);

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    server.auth.strategy('songsapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: playlists,
            options: {
                service: playlistsService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                validator: CollaborationsValidator,
            },
        }
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof Error) {
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }

            if (!response.isServer) {
                return h.continue;
            }

            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server',
            });
            console.log(`Error: ${response.message}`);
            newResponse.code(500);
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
