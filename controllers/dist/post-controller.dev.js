"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require("../prisma/prisma-client"),
    prisma = _require.prisma;

var PostController = {
  createPost: function createPost(req, res) {
    var content, authorId, post;
    return regeneratorRuntime.async(function createPost$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            content = req.body.content;
            authorId = req.user.userId;

            if (content) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", res.status(400).json({
              error: "Все поля обезательны"
            }));

          case 4:
            _context.prev = 4;
            _context.next = 7;
            return regeneratorRuntime.awrap(prisma.post.create({
              data: {
                content: content,
                authorId: authorId
              }
            }));

          case 7:
            post = _context.sent;
            res.json(post);
            _context.next = 15;
            break;

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](4);
            console.error("Create post error", _context.t0);
            res.status(500).json({
              error: "Internal server error"
            });

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[4, 11]]);
  },
  getAllPosts: function getAllPosts(req, res) {
    var userId, posts, postWithLikeInfo;
    return regeneratorRuntime.async(function getAllPosts$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            userId = req.user.userId;
            _context2.prev = 1;
            _context2.next = 4;
            return regeneratorRuntime.awrap(prisma.post.findMany({
              // Вывод всех постов
              include: {
                likes: true,
                author: true,
                comments: true
              },
              // сертировка постов
              orderBy: {
                createdAt: "desc"
              }
            }));

          case 4:
            posts = _context2.sent;
            // проверяем полученные посты и проверяем пользователя поставил ли он лайк посту
            postWithLikeInfo = posts.map(function (post) {
              return _objectSpread({}, post, {
                likedByUser: post.likes.some(function (like) {
                  return like.userId === userId;
                })
              });
            });
            res.json(postWithLikeInfo);
            _context2.next = 13;
            break;

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](1);
            console.error("get all post error", _context2.t0);
            res.status(500).json({
              error: "Internal server error"
            });

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[1, 9]]);
  },
  getPostId: function getPostId(req, res) {
    var id, userId, post, postWithLikeInfo;
    return regeneratorRuntime.async(function getPostId$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            id = req.params.id;
            userId = req.user.userId;
            _context3.prev = 2;
            _context3.next = 5;
            return regeneratorRuntime.awrap(prisma.post.findUnique({
              // поск комментария по id
              where: {
                id: id
              },
              include: {
                comments: {
                  include: {
                    user: true
                  }
                },
                likes: true,
                author: true
              }
            }));

          case 5:
            post = _context3.sent;

            if (post) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt("return", res.status(404).json({
              error: "Пост не найтен"
            }));

          case 8:
            // узнаем лайкнул ли его пользователь
            postWithLikeInfo = _objectSpread({}, post, {
              likedByUser: post.likes.some(function (like) {
                return like.userId === userId;
              })
            });
            res.json(postWithLikeInfo);
            _context3.next = 16;
            break;

          case 12:
            _context3.prev = 12;
            _context3.t0 = _context3["catch"](2);
            console.error("Get Post by Id error", _context3.t0);
            res.status(500).json({
              error: "Internal server error"
            });

          case 16:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[2, 12]]);
  },
  deletePost: function deletePost(req, res) {
    var id, post, transaction;
    return regeneratorRuntime.async(function deletePost$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            id = req.params.id; // Ищим пост

            _context4.next = 3;
            return regeneratorRuntime.awrap(prisma.post.findUnique({
              where: {
                id: id
              }
            }));

          case 3:
            post = _context4.sent;

            if (post) {
              _context4.next = 6;
              break;
            }

            return _context4.abrupt("return", res.status(404).json({
              error: "Пост не найден"
            }));

          case 6:
            if (!(post.authorId !== req.user.userId)) {
              _context4.next = 10;
              break;
            }

            console.log(req.user.userId);
            console.log(req.user.id);
            return _context4.abrupt("return", res.status(403).json({
              error: "Нет доступа"
            }));

          case 10:
            _context4.prev = 10;
            _context4.next = 13;
            return regeneratorRuntime.awrap(prisma.$transaction([prisma.comment.deleteMany({
              where: {
                postId: id
              }
            }), // удаление коментариев у поста
            prisma.like.deleteMany({
              where: {
                postId: id
              }
            }), // удаление лайков у поста
            prisma.post["delete"]({
              where: {
                id: id
              }
            }) // удаление самого поста
            ]));

          case 13:
            transaction = _context4.sent;
            res.json(transaction);
            _context4.next = 21;
            break;

          case 17:
            _context4.prev = 17;
            _context4.t0 = _context4["catch"](10);
            console.error("Delete Post error", _context4.t0);
            res.status(500).json({
              error: "Internal server error"
            });

          case 21:
          case "end":
            return _context4.stop();
        }
      }
    }, null, null, [[10, 17]]);
  }
};
module.exports = PostController;