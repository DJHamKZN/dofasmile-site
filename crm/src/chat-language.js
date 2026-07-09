//+------------------------------------------------------------------+
//|                                       MetaTrader 5 Administrator |
//|                   Copyright 2001-2011, MetaQuotes Software Corp. |
//|                                        http://www.metaquotes.net |
//+------------------------------------------------------------------+
(function ()
  {
   /**
    * Ссылка на выбранный язык
    * @private
    */
   var current = null;
   /**
    * Объект с публичными методами для взаимодействия с окружением
    * @public
    */
   window.ChatLanguage =
     {
      /**
       * Метод инициализирует язык
       * @param {String} lang Идентификатор языка
       * @public
       */
      init : function (lang)
        {
         if (!lang && navigator.language) lang = navigator.language;
         if (!lang && navigator.userLanguage) lang = navigator.userLanguage;
         if (!lang && navigator.systemLanguage) lang = navigator.systemLanguage;
         //---
         current = source[lang.toLowerCase()] || source.en;
        },
      /**
       * Метод возвращает перевод для ключа
       * @param {String} key Ключ
       * @return {String} Перевод
       * @public
       */
      tr : function (key)
        {
         return current[key] || key;
        },
      /**
       * Метод добавляет переводы
       * Необходимо вызывать до инициализации
       * @param {String} lang Идентикатор языка
       * @param {Object} translates Список переводов
       * @public
       */
      addTranslate : function (lang, translates)
        {
         source[lang] = translates;
        }
     };
   /**
    * Объект с исходными переводами
    * @private
    */
   var source =
     {
      ru :
        {
         LOGIN_TITLE : 						"Введите свои контактные данные",
         LOGIN_ENTER : 						"Начать",
         LOGIN_CANCEL : 					"Отмена",
         LOGIN_NAME : 						"Имя",
         LOGIN_EMAIL : 						"Электронная почта",
         LOGIN_PHONE : 						"Телефон",
         LOGIN_COMPANY : 					"Компания",
         LOGIN_ACCOUNT : 					"Счет",
         LOGIN_GROUP : 						"Группа",
         LOGIN_TOPIC : 						"Тема",
         LOGIN_SUCCESS : 					"Вход выполнен успешно.",
         LOGIN_NO_SUCCESS : 			"Вход в чат запрещен.",
         LOGIN_INIT : 						"Пожалуйста, подождите...",
         LOGIN_RETRY : 						"Повторить",
         LOGIN_ERROR : 						"Не удалось установить соединение с сервером.",
         LOGIN_INPUT_ERROR : 			"Входные параметры отсутствуют!",
         //
         DIALOG_SEND : 						"Отправить",
         DIALOG_SEND_TITLE : 			"Отправить сообщение",
         DIALOG_ATTACH : 					"Отправить файл",
         DIALOG_CLOSE : 					"Завершить",
         DIALOG_CLOSE_TITLE :			"Завершить диалог",
         DIALOG_COPY : 						"Копировать в буфер обмена",
         DIALOG_COPY_TITLE :  		"Скопировать текст в буфер обмена",
         DIALOG_EXIT : 						"Закрыть",
         DIALOG_TOOLTIP :					"Скопировать весь диалог в буфер-обмена",
         DIALOG_COMPLETED :				"Завершен",
         DIALOG_NEW :					    "Новый чат",
         //
         QUESTION_YES : 					"Да",
         QUESTION_NO : 						"Нет",
         //
         RESTORE : 								"Восстановить предыдущую сессию?",
         CLOSE : 									"Вы действительно хотите завершить сессию?",
         ERROR : 									"Не удалось установить соединение с сервером.\nПопробуйте повторить попытку позже.",
         //
         WELCOME_MESSAGE : 				"Представитель нашей компании свяжется с Вами в ближайшее время. Вы можете задать вопрос прямо сейчас.",
         WELCOME_MESSAGE_ : 			"Представитель нашей компании ответит Вам в ближайшее время. Если этого не произойдет, то мы позже свяжемся с Вами по электронной почте.",
         //
         SYSTEM_MESSAGE_JOIN : 									  " в чате.",
         SYSTEM_MESSAGE_LOST_CONNECTION : 				" завершил общение.",
         SYSTEM_MESSAGE_RECONNECT : 							" вне чата по таймауту.",
         SYSTEM_MESSAGE_CLOSE : 									" снова в чате.",
         SYSTEM_MESSAGE_TIMEOUT : 								"Чат завершился по таймауту.",
         SYSTEM_MESSAGE_MANAGER : 								"Менеджер",
         //
         RAITING :								"Оценка",
         RAITING_MESSAGE : 				"Поставьте оценку диалогу с нашим сотрудником",
         //
         NET_STATUS : "Пропало соединение с сервером. Повторная попытка соединения...",
         //
         TYPING : 'Консультант набирает сообщение',
         //
         MB : 'Мб',
         KB : 'Кб',
         BYTE : 'байт',
         //
         FILE_SENDING : 'Отправка файла...'
        },
      //---
      en :
        {
         LOGIN_TITLE : 						"Please enter your contact information",
         LOGIN_ENTER : 						"Enter",
         LOGIN_CANCEL : 					"Cancel",
         LOGIN_NAME : 						"Name",
         LOGIN_EMAIL : 						"Email",
         LOGIN_PHONE : 						"Phone",
         LOGIN_COMPANY : 					"Company",
         LOGIN_ACCOUNT : 					"Account",
         LOGIN_GROUP : 						"Group",
         LOGIN_TOPIC : 						"Topic",
         LOGIN_SUCCESS : 					"You have successfully joined the chat.",
         LOGIN_NO_SUCCESS : 			"You are not allowed to join the chat.",
         LOGIN_INIT : 						"Please wait...",
         LOGIN_RETRY : 						"Retry",
         LOGIN_ERROR : 						"Failed establishing connection to the server.",
         LOGIN_INPUT_ERROR : 			"Input settings are not correct!",
         //
         DIALOG_SEND : 						"Send",
         DIALOG_SEND_TITLE : 			"Send a message",
         DIALOG_ATTACH : 					"Send file",
         DIALOG_CLOSE : 					"Complete",
         DIALOG_CLOSE_TITLE : 		"End the dialogue",
         DIALOG_COPY : 						"Copy to Clipboard",
         DIALOG_COPY_TITLE : 			"Copy text to clipboard",
         DIALOG_EXIT : 						"Close",
         DIALOG_TOOLTIP :					"Copy the whole dialog to clipboard",
         DIALOG_COMPLETED :				"Сompleted",
         DIALOG_NEW :					    "New chat",
         //
         QUESTION_YES : 					"Yes",
         QUESTION_NO : 						"No",
         //
         RESTORE : 								"Restore the previous session?",
         CLOSE : 									"Do you really want to close the session?",
         ERROR : 									"Failed establishing connection to the server. Please try again later.",
         //
         WELCOME_MESSAGE : 				"Our company representative will be with you in a moment. Meanwhile you can submit your question.",
         WELCOME_MESSAGE_ : 			"Our company representative will be with you in a moment.",
         //
         SYSTEM_MESSAGE_JOIN : 									  " has joined the chat.",
         SYSTEM_MESSAGE_LOST_CONNECTION : 				" has closed the chat.",
         SYSTEM_MESSAGE_RECONNECT : 							" has lost connection.",
         SYSTEM_MESSAGE_CLOSE : 									" has reconnected.",
         SYSTEM_MESSAGE_TIMEOUT : 								"Chat closed by timeout.",
         SYSTEM_MESSAGE_MANAGER : 								"Manager",
         //
         RAITING :								"Rating",
         RAITING_MESSAGE : 				"Please rate the quality of assistance you received from our technical support specialist.",
         //
         NET_STATUS : "Connection to the server has been lost. Trying to reconnect...",
         //
         TYPING : 'The consultant is typing',
         //
         MB : 'Mb',
         KB : 'Kb',
         BYTE : 'byte',
         //
         FILE_SENDING : 'Sending file...'
        }
     }
  })();
