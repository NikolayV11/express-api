const { prisma } = require("../prisma/prisma-client");

const LikeController = {
  likePost: async (req, res) => {
    const { postId } = req.body;
    const userId = req.user.userId;

    if (!postId) {
      return res.status(400).json({ error: "Все поля обезательны" });
    }

    try {
      // Проверяем поставили мы лайк посту ранее
      const existingLike = await prisma.like.findFirst({
        where: { postId, userId },
      });

      if (existingLike) {
        return res.status(400).json({ error: "Вы уже поставили лайк" });
      }

      // ставим лайк посту
      const like = await prisma.like.create({
        data: { postId, userId },
      });

      res.status(201).json(like);
    } catch (error) {
      console.error("Error like post", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
  unlikePost: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    // Если не передали id лайка
    if (!id) {
      return res.status(400).json({ error: "Вы уже поставили дизлак" });
    }

    try {
      // проверяем стоит ли лайк
      const existingLike = await prisma.like.findFirst({
        where: { postId: id, userId },
      });

      if (!existingLike) {
        return res.status(400).json({ error: "Нельзя поставить дизлайк" });
      }

      // удаляем лайк
      const like = await prisma.like.deleteMany({
        where: { postId: id, userId },
      });

      res.json(like);
    } catch (error) {
      console.error("Error unlike post", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = LikeController;
