import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { isOwner } from '../middlewares/isOwner.middleware.js';
import { Playlist } from '../models/playlist.model.js';

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(isOwner(Playlist, "playlistId"),updatePlaylist)
    .delete(isOwner(Playlist, "playlistId"),deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(isOwner(Playlist, "playlistId"),addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(isOwner(Playlist, "playlistId"),removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router