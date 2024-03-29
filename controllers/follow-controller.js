const { prisma } = require("../prisma/prisma-client");

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (!followingId) {
      return res.status(400).json({ error: "Все поля обезательны" });
    }

    if (followingId === userId) {
      return res.status(500).json({ error: "Вы не можете подписатся на самого себя" });
    }

    try {
      const existingSubscription = await prisma.follows.findFirst({
        where: {
          AND: [
            {
              followerId: userId, // я добовляю
            },
            {
              followingId, // кого я добовляю
            },
          ],
        },
      });

      if (existingSubscription) {
        return res.status(400).json({ error: "Подска уже существует" });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: "Подписка успешно создана" });
    } catch (error) {
      console.error("Follow error", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
  unfollowUser: async (req, res) => {
    const { followingId } = req.body;

    if (!followingId) {
      return res.status(400).json({ error: "Все поля обезательны" });
    }

    const userId = req.user.userId;

    try {
      // проверяет подписаны ли мы на него
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [
            {
              followerId: userId,
            },
            {
              followingId,
            },
          ],
        },
      });

      if (!follows) {
        return res.status(404).json({ error: "Вы не подписаны на этого пользователя" });
      }

      await prisma.follows.delete({
        where: { id: follows.id },
      });

      res.status(201).json({ message: "Вы отписались от пользователя" });
    } catch (error) {
      console.error("Unfollow error", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = FollowController;
