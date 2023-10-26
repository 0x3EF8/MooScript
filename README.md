# Hexabot - Your Student Assistant Messenger Bot

Hexabot is a Facebook Messenger bot designed to assist students with various features, including AI-powered responses, file searches, music and video searches, and more. The bot is built using the fca-unofficial library and integrates with APIs to provide a wide range of capabilities.

## Features

1. **AI-Powered Responses**: Hexabot leverages AI technologies, including the OpenAI API, to provide intelligent responses to user queries, helping students with questions related to various subjects.

2. **File Search and Sharing**: Easily search and send files like PDFs, DOCX, and other office files to your chat directly through Hexabot.

3. **Music and Video Search**: Search for music, lyrics, and videos to keep yourself entertained while studying or taking a break.

4. **Command List**: To explore all available commands, simply send a message "cmd" to Hexabot. It will respond with a list of commands you can use.

## Getting Started

1. **Installation**: Clone this repository and follow the setup instructions to configure and deploy your own instance of Hexabot.

2. **Dependencies**: Make sure you have the required dependencies installed, including Node.js.

3. **API Keys**: Obtain necessary API keys, such as the OpenAI API key, and configure them in the appropriate files.

4. **Running the Bot**: Run the bot using the command `node index.js` or `npm start`.

## Usage

- To interact with Hexabot, open a conversation with the bot on Facebook Messenger.
- Use the available commands to access different features. For example:
  - Send a file: `getfile <file format> <file_title>`
  - Ask the AI: `ai <your_question>`
  - Search music: `music <song title>`
  - Search video: `video <video_title>`
  - List all commands: `cmd or cmd 1-10`

## Contributing

Contributions are welcome! If you'd like to contribute to Hexabot, please follow these steps:

1. Fork the repository and create a new branch.
2. Make your changes and test thoroughly.
3. Submit a pull request explaining your changes and additions.

## Credits

- The base of this project is built upon [fca-unofficial](https://github.com/VangBanLaNhat/fca-unofficial) library by VangBanLaNhat.
- Hexabot was developed by Jay Patrick Cano and other Hexclan members.

## License

This project is licensed under the [MIT License](LICENSE).
