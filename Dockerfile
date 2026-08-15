FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制所有文件
COPY . .

# 安装依赖并构建
RUN chmod +x build-all.sh && bash build-all.sh

# 暴露端口
EXPOSE 3000

# 设置环境
ENV NODE_ENV=production
ENV PORT=3000

# 启动命令
CMD ["node", "server/src/index.js"]
