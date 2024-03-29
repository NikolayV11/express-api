const express = require("express");

const router = express.Router();

const multer = require("multer");
const {
  UserController,
  PostController,
  CommentController,
  LikeController,
  FollowController,
} = require("../controllers");
const { authenticateToken } = require("../middleware/auth");

const uploadDestination = "uploads"; // имя папки
// Показать где хранить файлы
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, next) {
    next(null, file.originalname);
  },
});

// хранилище и название созданого файла пкредается клиенту
const uploads = multer({ storage: storage });

// routes для пользователя
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/current", authenticateToken, UserController.current);
router.get("/users/:id", authenticateToken, UserController.getUserById);
router.put("/users/:id", authenticateToken, UserController.updateUser);

// routes для постов
router.post("/posts", authenticateToken, PostController.createPost);
router.get("/posts", authenticateToken, PostController.getAllPosts);
router.get("/posts/:id", authenticateToken, PostController.getPostId);
router.delete("/posts/:id", authenticateToken, PostController.deletePost);

// router для комминтариев
router.post("/comments", authenticateToken, CommentController.createComment);
router.delete("/comments/:id", authenticateToken, CommentController.deleteComment);

// route для лайков постов
router.post("/likes", authenticateToken, LikeController.likePost);
router.delete("/likes/:id", authenticateToken, LikeController.unlikePost);

// route для подписок
router.post("/follow", authenticateToken, FollowController.followUser);
router.delete("/unfollow", authenticateToken, FollowController.unfollowUser);

module.exports = router;
