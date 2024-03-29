const path = require("path");
const fs = require("fs");
const { prisma } = require("../prisma/prisma-client");
// для хешириаония строки - password
const bcrypt = require("bcryptjs");
// генирация авотарки
const Jdenticon = require("jdenticon");
//генирация токина
const jwt = require("jsonwebtoken");

const UserController = {
  // Регистрация
  register: async (req, res) => {
    const { email, password, name } = req.body;
    console.log(email, password, name);
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Все поля обезательны" });
    }
    try {
      // проверяем существует ли пользователь с таким email
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ error: "Пользователь уже существует" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const png = Jdenticon.toPng(name, 200);
      // генирация имени для аватарки
      const avatarName = `${name}_${Date.now()}.png`;
      // путь до файла
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      // сохранение авотарки
      fs.writeFileSync(avatarPath, png);

      //добавление пользователя в базу данных
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Error in register", error);
      res.status(500).json({ error: "Internal server error" });
    }
    res.end();
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Все поля обезательны" });
    }

    try {
      // поиск пользователя в базе данных
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      // сравнения пароля полученного и сохраненного
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      // шифруем id пользователя
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);
      res.json({ token });
    } catch (error) {
      console.error("Login error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id }, // найти пользователя
        // пришли всех подписчиков и друзей
        include: {
          followers: true,
          following: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      // проверка на то что пользователь на нас подписан
      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [
            {
              followerId: userId,
            },
            {
              followingId: id,
            },
          ],
        },
      });

      res.json({ ...user, isFollowing: Boolean(isFollowing) });
    } catch (error) {
      console.error("Get Current Error", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
  updateUser: async (req, res) => {
    const { id } = req.params;

    const { email, name, dateOfBirth, bio, location } = req.body;

    // проверяем пришёл ли файл
    let filePath;
    // если файл пришёл
    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    // проверка у кокого пользователя обновляем данные
    if (id !== req.user.userId) {
      return res.status(404), json({ error: "Нет доступа" });
    }

    try {
      // проверяем email занят ли другим пользователем
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email },
        });

        if (existingUser && existingUser.id !== id) {
          return res.status(400).json({ error: "Почта уже используется" });
        }
      }

      // перезаписываем данные у пользователя
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Update user error", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
  current: async (req, res) => {
    // текущий пользователь
    try {
      const user = await prisma.user.findUnique({
        // проверка пользователя
        where: {
          id: req.user.userId,
        },
        // что включить для отображения
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(400).json({ error: "Не удалось найти пользователя" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get Current Error", error);

      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = UserController;
