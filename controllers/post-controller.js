const { prisma } = require("../prisma/prisma-client");

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: "Все поля обезательны" });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      });

      res.json(post);
    } catch (error) {
      console.error("Create post error", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
  getAllPosts: async (req, res) => {
    const userId = req.user.userId;

    try {
      const posts = await prisma.post.findMany({
        // Вывод всех постов
        include: {
          likes: true,
          author: true,
          comments: true,
        }, // сертировка постов
        orderBy: {
          createdAt: "desc",
        },
      });

      // проверяем полученные посты и проверяем пользователя поставил ли он лайк посту
      const postWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }));

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error("get all post error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getPostId: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const post = await prisma.post.findUnique({
        // поск комментария по id
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          likes: true,
          author: true,
        },
      });

      if (!post) {
        return res.status(404).json({ error: "Пост не найтен" });
      }

      // узнаем лайкнул ли его пользователь
      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      };

      res.json(postWithLikeInfo);
    } catch (error) {
      console.error("Get Post by Id error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deletePost: async (req, res) => {
    const { id } = req.params;

    // Ищим пост
    const post = await prisma.post.findUnique({ where: { id } });

    //проверяем на существование поста
    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    // Проверяем пользователя евляется ли он автором поста
    if (post.authorId !== req.user.userId) {
      console.log(req.user.userId);
      console.log(req.user.id);
      return res.status(403).json({ error: "Нет доступа" });
    }

    try {
      // удаление поста и зависимостей
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }), // удаление коментариев у поста
        prisma.like.deleteMany({ where: { postId: id } }), // удаление лайков у поста
        prisma.post.delete({ where: { id } }), // удаление самого поста
      ]);

      res.json(transaction);
    } catch (error) {
      console.error("Delete Post error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = PostController;
