//+------------------------------------------------------------------+
//|                                       MetaTrader 5 Administrator |
//|                   Copyright 2001-2011, MetaQuotes Software Corp. |
//|                                        http://www.metaquotes.net |
//+------------------------------------------------------------------+
(function ()
{
/**
 * Запомним ссылку на функцию перевода
 * @public
 */
var lng = ChatLanguage.tr,
/**
 *
 */
ie,                 // Флаг указывает, что работаем с InternetExplorer
ie_version,         // Версия InternetExplorer
has_frame_messager; // Наличие поддержки обмена сообщениями между фреймами
/**
 * Объект для работы с сетью
 * Эмулирует GET и POST запросы
 * @public
 */
var JSNOP;
(function ()
  {
   /**
    *
    */
   /**********************
    * Приватные свойства *
    **********************/
   /**
    *
    */
   var form,    // Ссылка на элемент формы, которая будет служить для отправки формы
   iframe,      // Ссылка на элемент фрейма, для приема ответа POST-запросов
   container;   // Метод инициализирует механизи отправки запросов на сервер
   /**
    *
    */
   /********************
    * Публичные методы *
    ********************/
   /**
    *
    */
   JSNOP =
    {
     /**
      * Метод инициализирует работу с сетью
      * @param {Element} element Ссылка на корневой элемент чата
      * @public
      */
     init : function (element)
       {
        if(!element) return(false);
        //---
        container = element;
        //---
        form = createNode('form');
        addNode(container, form);
        //---
        iframe = createNode('iframe');
        setAttributeForNode(iframe, 'name', 'jsnop');
        addNode(container, iframe);
        //---
        var ua = window.navigator.userAgent;
        //---
        ie = ua.indexOf('MSIE') != -1;
        if(ie)
          {
           if(ua.indexOf('Trident/') != -1)
             {
              if(ua.indexOf('Trident/4') != -1) ie_version = 8;
              else if (ua.indexOf('Trident/5') != -1) ie_version = 9;
              else if (ua.indexOf('Trident/6') != -1) ie_version = 10;
              else ie_version = 6;
             }
           else
             {
              ie_version = 6;
             }
           /**
           var i = ua.indexOf("MSIE ");
           if(i>0)
             {
              ua = ua.substr(i+5);
              //---
              ie_version = parseInt(ua,10);
              if(ie_version < 8 && "arr"[0]!==undefined)
                {
                 ie_version = 8;
                }
              }
            */
           }
        //---
        has_frame_messager = ('onmessage' in window);
        if(ie && ie_version < 9)
          has_frame_messager = false;
       },
     /**
      * Метод отправляет GET-запрос на сервер
      * @param {String} url Адрес запроса
      * @param {Object} params Список параметров
      * @param {String} callbackName Имя замыкающей функции
      * @public
      */
     get : function (url, params, callbackName, errorCallback)
       {
        if(!url || !callbackName) return(false);
        //---
        var script_id = Math.random().toString().substr(2);
        url += ['?json=&callback=', callbackName, '&script_id=', script_id].join('');
        if(params)
          {
           for (var i in params)
             {
              if(params[i] !== undefined && params[i] !== null)
                url += ['&', i, '=', params[i]].join('');
             }
          }
        //---
        var script = createNode('script'), self = this, on_load, on_error;
        //---
        if(ie)
          {
           addEventListenerForNode(script, 'readystatechange', on_load = function (e)
             {
              if(script.readyState == 'loaded')
                {
                 removeEventListenerForNode(script, 'readystatechange', on_load);
                 setTimeout(function ()
                   {
                    if(script.__loaded !== true && errorCallback) errorCallback(params);
                    removeNode(script);
                   }, 100);
                }
             });
          }
        else
          {
           addEventListenerForNode(script, 'error', on_error = function (e)
             {
              if(errorCallback) errorCallback(params, e);
              //---
              removeEventListenerForNode(script, 'error', on_error);
              removeEventListenerForNode(script, 'load', on_load);
              //---
              setTimeout(function ()
                {
                 removeNode(script);
                }, 1000);
             });
           //---
           addEventListenerForNode(script, 'load', on_load = function ()
             {
              removeEventListenerForNode(script, 'error', on_error);
              removeEventListenerForNode(script, 'load', on_load);
              //---
              setTimeout(function ()
                {
                 if(script.__loaded === true)
                   removeNode(script);
                }, 1000);
             });
          }
        //---
        setAttributeForNode(script, { id : 'id_' + script_id, 'type' : 'text/javascript', 'src' : url });
        setTimeout(function () { addNode(container, script) }, 0);
       },
     /**
      * Метод отправляет POST-запрос на сервер
      * @param {String} url Адрес запроса
      * @param {Object} params Список параметров
      * @public
      */
     post : function (url, params, callbackFile, errorCallback, file)
       {
        var onload, input, args = arguments;
        //---
        if(!form || !url) return(false);
        //---
        if(!has_frame_messager)
          iframe.contentWindow.name = 'jsnop';
        //---
        if(callbackFile)
          {
           if(ie)
             {
              var second = false;
              addEventListenerForNode(iframe, 'readystatechange', onload = function ()
                {
                 if(iframe.readyState == 'complete')
                   {
                    if(file)
                      {
                       removeEventListenerForNode(iframe, 'readystatechange', onload);
                       iframe.contentWindow.location = callbackFile;
                       return;
                      }
                    //---
                    if(second)
                      {
                       removeEventListenerForNode(iframe, 'readystatechange', onload);
                       try
                         {
                          if(iframe.contentWindow.name == 'jsnop')
                             errorCallback(args);
                         }
                       catch (a)
                         {
                          errorCallback(args);
                         }
                      }
                    else
                      {
                       if(has_frame_messager)
                         {
                          removeEventListenerForNode(iframe, 'readystatechange', onload);
                          return;
                         }
                       //---
                       iframe.contentWindow.location = callbackFile;
                       second = true;
                      }
                   }
                });
             }
           else
             {
              second = false;
              addEventListenerForNode(iframe, 'load', onload = function ()
                {
                 if(file)
                   {
                    removeEventListenerForNode(iframe, 'load', onload);
                    iframe.src = callbackFile;
                    return;
                   }
                 //---
                 if(has_frame_messager)
                   {
                    removeEventListenerForNode(iframe, 'load', onload);
                    return;
                   }
                 //---
                 if(second)
                   removeEventListenerForNode(iframe, 'load', onload);
                 //---
                 second = true;
                 //---
                 iframe.src = callbackFile;
                });
             }
          }
        //---
        clearNode(form);
        //---
        var send_form = file ? file : form;
        //---
        setAttributeForNode(send_form, { 'method' : 'post', 'action' : url + '?json=&callback=' + (has_frame_messager ? '2' : '1'), target : 'jsnop' });
        if(file)
          setAttributeForNode(send_form, { 'enctype' : 'multipart/form-data' });
        //---
        for (var i in params)
          {
           input = createNode('input');
           setAttributeForNode(input, { type : 'hidden', name : i, value : params[i]});
           addNode(send_form, input);
          }
        //---
        send_form.submit();
       },
     //---
     onload : function (scriptId)
       {
        var script = getElementById('id_'+scriptId);
        if(script) script.__loaded = true;
       },
     /**
      * Метод возвращает флаг того что браузером является InternetExplorer
      * @return {Boolean}
      * @public
      */
     isMSIE : function ()
       {
        return(ie);
       },
     /**
      * Метод возвращает версию интернет эксплорера
      * @return {Number}
      * @public
      */
     ieVersion : function ()
       {
        return(ie_version);
       }
    };
  })();
/**
 * Объект для хранения всех основных свойств и данных диалога
 * @public
 */
var Model;
(function ()
  {
   /**
    *
    */
   /*******************************
    * Публичные методы и свойства *
    *******************************/
   /**
    *
    */
   Model =
     {
      /**
       * Имя пользователя
       * @public
       */
      name : null,
      /**
       * Электронная почта
       * @public
       */
      email : null,
      /**
       * Телефон
       * @public
       */
      phone : null,
      /**
       * Компания
       * @public
       */
      company : null,
      /**
       * Номер счета
       * @public
       */
      account : null,
      /**
       * Цифровая подпись
       * @public
       */
      digital_signature : null,
      /**
       * Имя группы по умолчанию
       * @public
       */
      default_group : null,
      /**
       * Название темы по умолчанию
       * @public
       */
      default_topic : null,
      /**
       * Кешировать введеные при входе данные о пользователе?
       * @public
       */
      cache : null,
      /**
       * Показывать всплывающие окна предупреждения
       * @public
       */
      without_window : null,
      /**
       * Язык интерфейса
       * @public
       */
      language : null,
      /**
       * Фильтр для запроса групп
       * @public
       */
      filter : null,
      /**
       * Идентификатор предопределенной группы
       * @public
       */
      default_group_id : null,
      /**
       * Предопределення настройка полей на странице входа
       * @public
       */
      config : null,
      /**
       * Автоматический вход
       * @public
       */
      autologin : null,
      /**
       * Список групп
       * @public
       */
      groups : [],
      /**
       * Список тем
       * @public
       */
      topics : [],
      /**
       * Идентификатор сессии
       * @public
       */
      session_id : null,
      /**
       * Сообщение привествия
       * @public
       */
      welcome_message : null,
      /**
       * Список сообщений
       * @public
       */
      messages : [],
      /**
       * Список временных сообщений, не подтвержденных сервером
       * @public
       */
      temp : [],
      /**
       * Список ссылок на сообщения по идентификатору
       * @public
       */
      ids : {},
      /**
       * Состояние диалога
       * @public
       */
      state : null,
      /**
       * Оценка диалога
       * @public
       */
      score : 0,
      /**
       * Идентификатор диалога
       * @public
       */
      dialog_id : null,
      /**
       * Идентификатор сервера
       * Если он поменяется, значит сервер перезагружался и необходимо обновить все сообщения
       * @public
       */
      server_id : null,
      /**
       * Идентификатор пользователя
       * Использется при отправке сообщений
       * @public
       */
      user_id : null,
      /**
       * Текст в окне логина
       */
      login_text : null,
      /**
       * Флаг, говорит о том что консультант набирает сообщение
       */
      typing : false,
      /**
       * Дата последнего нажатия клавишы в поле ввода сообщения
       * Отправляется на сервер
       */
      typing_time : null,
      /**
       * Количество набранных символов
       * Отправляется на сервер
       */
      typing_count : 0,
      /**
       * Флаг говорит о возможности передавать файлы
       */
      transfer_files : false,
      /**
       * Метод возвращает список сообщений, которые готовы быть отрисованными
       * @return {Array} Список сообщений
       * @public
       */
      getMessages : function ()
        {
         var res = [],
             arr, i, j, m;
         //---
         arr = Model.messages;
         if(arr)
           {
            for(i=0, j=arr.length; i<j; i++)
              {
               m=arr[i];
               if(m) res.push(m);

              }
           }
         //---
         arr = Model.temp;
         if(arr)
           {
            for(i=0, j=arr.length; i<j; i++)
              {
               m=arr[i];
               if(m && m.sended !== true)
                 res.push(m);
              }
           }
         //---
         return(res);
        },
      /**
       * Метод очищает модель
       * @public
       */
      clear : function ()
        {
         Model.name = null;
         Model.email = null;
         Model.phone = null;
         Model.company = null;
         Model.account = null;
         Model.digital_signature = null;
         Model.default_group = null;
         Model.default_topic = null;
         Model.cache = null;
         Model.language = null;
         Model.filter = null;
         Model.default_group_id = null;
         Model.config = null;
         Model.autologin = null;
         Model.groups = [];
         Model.topics = [];
         Model.session_id = null;
         Model.welcome_message = null;
         Model.messages = [];
         Model.ids = {};
         Model.temp = [];
         Model.state = null;
         Model.score = 0;
         Model.dialog_id = null;
         Model.server_id = null;
         Model.user_id = null;
         Model.login_text = null;
         Model.typing = false;
         Model.typing_time = null;
         Model.typing_count = 0;
         Model.transfer_files = false;
        }
    };
  })();
/**
 * Объект с методами для отрисовки и перерисовки контролов чата
 * @public
 */
var View;
(function ()
  {
   /**
    *
    */
   /**********************
    * Приватные свойства *
    **********************/
   /**
    *
    */
   var container,       // Ссылка на корневой контейнер чата
   body,                // Ссылка на контейнер тела чата
   window,              // Ссылка на элемент псевдомодального окна
   background,          // Ссылка на элемент фона псевдомодального окна
   //---
   login_name,          // Ссылка на поле ввода "Имя"
   login_email,         // Ссылка на поле ввода "Электронная почта"
   login_company,       // Ссылка на поле ввода "Компания"
   login_account,       // Ссылка на поле ввода "Счет"
   login_phone,         // Ссылка на поле ввода "Телефон"
   login_groups,        // Ссылка на поле ввода "Группа"
   login_topics,        // Ссылка на поле ввода "Тема"
   login_enter,         // Ссылка на кнопку "Начать"
   //---
   dialog_list,         // Ссылка на элемент для вывода списка сообщений
   dialog_text_area,    // Ссылка на поле ввода сообщения
   dialog_send,         // Ссылка на кнопку "Отправить"
   dialog_copy,         // Ссылка на кнопку "Копировать"
   dialog_close,        // Ссылка на кнопку "Завершить"
   dialog_new,          // Ссылка на кнопку "Новый диалог"
   dialog_timer,        // Ссылка на элемент с показом времени диалога
   dialog_score,        // Ссылка на элемент с оценкой диалога
   //---
   dialog_file_form,    // Ссылка на элемент отправки файла
   dialog_file_button,  // Ссылка на элемент отправки файла
   dialog_file_input,   // Ссылка на элемент отправки файла
   dialog_file_loader,  // Ссылка на элемент отправки файла
   //---
   dialog_colors,       // Объект со списком уже использованных индексов цветов для юзера
   dialog_colors_count, // Количество используемых индексов
   dialog_clipboard,    // Строка для копирования в буфер. Собирается каждый раз когда отрисовывается список.
   dialog_interval,     // Интервал для подсчета времени с начала диалога
   //---
   files='';            // Адрес папки с файлами относительно страницы
   /**
    *
    */
   /********************
    * Публичные методы *
    ********************/
   /**
    *
    */
   View =
    {
     /**
      * Метод инициализирует вьювер
      * @param {HTMLElement} element Ссылка на корневой контейнер чата
      * @public
      */
     init : function (element, settings)
       {
        if(!element) return(false);
        if(settings && settings.files) files = settings.files;
        //---
        container = element;
        //---
        var is_ie = false,
            user_agent = top.window.navigator.userAgent, version;
        //---
        if(user_agent.indexOf("MSIE")!=-1)
          {
           View.isMSIE = true;
           //---
           version = user_agent.indexOf("MSIE ");
           version = user_agent.substr(version+5);
           version = parseInt(version,10);
           //---
           View.navigatorVersion = version;
           //---
           if(version < 9)
             is_ie = true;
          }
        //---
        setClassNameForNode(container, 'chat' + (is_ie ? ' is_ie' : ''));
        //---
        var head = createNode('div');
        setClassNameForNode(head, 'head');
        addNode(container, head);
        //---
        var logo = createNode('div');
        setClassNameForNode(logo, 'logo');
        addNode(head, logo);
        //---
        body = createNode('div');
        setClassNameForNode(body, 'body');
        addNode(container, body);
        //---
        dialog_colors = {};
        dialog_colors_count = 1;
        dialog_interval = 0;
        //---
        View.windowTitle = settings.window_title || 'TeamWox Online Assistant';
       },
     /**
      * Метод показывает сообщение
      * @param {String} message Содержимое сообщения
      * @param {String} classname Имя класса для контейнера сообщения
      * @public
      */
     showMessage : function (message, classname, callback)
       {
        var text = createNode('div'),
            icon = createNode('span'),
            box, button, onclick;
        //---
        clearNode(body);
        //---
        addNode(body, text);
        addNode(text, icon);
        addNode(text, createText(message));
        //---
        if(callback)
          {
           box = createNode('div');
           addNode(text, box);
           //---
           button = createNode('button');
           addNode(button, createText(lng('LOGIN_RETRY')));
           addEventListenerForNode(button, 'click', onclick = function ()
             {
              removeEventListenerForNode(button, 'click', onclick);
              callback();
             });
           addNode(box, button);
           try { button.focus(); } catch(a) {}
          }
        //---
        setClassNameForNode(text, 'message');
        setClassNameForNode(text, classname);
        setStyleForNode(text, 'marginTop', '-' + Math.ceil(text.offsetHeight * .5) + 'px');
       },
     /**
      * Метод показывает модальное окно
      * @param {String} title Заголовок окна
      * @param {Object} size Размер окна
      * @public
      */
     showWindow : function (title, size)
       {
        background = createNode('div');
        setClassNameForNode(background, 'background');
        addNode(container, background);
        //---
        window = createNode('div');
        setClassNameForNode(window, 'window');
        setStyleForNode(window,{'width':size.width+'px','height':size.height+'px'});
        addNode(container, window);
        //---
        var head = createNode('div');
        setClassNameForNode(head, 'header');
        addNode(head, createText(title));
        addNode(window, head);
        //---
        var body = createNode('div');
        setClassNameForNode(body, 'content');
        addNode(window, body);
        //---
        setTimeout(function ()
          {
           setStyleForNode(window,{'marginTop':'-'+(window.offsetHeight*.5)+'px','marginLeft':'-'+(window.offsetWidth*.5)+'px'});
          }, 0);
        //---
        return(body);
       },
     /**
      * Метод закрывает модальное окно
      * @public
      */
     hideWindow : function ()
       {
        if(background)
          {
           removeNode(background);
           background = null;
          }
        //---
        if(window)
          {
           removeNode(window);
           window = null;
          }
       },
     /**
      * Метод показывает сообзение о загрузке данных
      * @public
      */
     showLoading : function ()
       {
        var message = createNode('div'),
            icon = createNode('img');
        //---
        clearNode(body);
        addNode(body, message);
        addNode(message, icon);
        addNode(message, createText(lng('LOGIN_INIT')));
        //---
        setClassNameForNode(message, 'message');
        setClassNameForNode(message, 'loading');
        setAttributeForNode(icon, { 'src' : files + 'i/loader.gif', 'alt' : '', 'title' : '' });
        setStyleForNode(message,'marginTop',Math.ceil(message.offsetHeight * .5)+'px');
       },
     /**
      * Метод показывает диалоговое окно для подвтерждения
      * @param {String} message Сообщение
      * @param {Function} callback Функция, которую нужно будет вызвать после подтверждения
      * @param {Function} [cancel_callback] Функция, которую нужно будет вызвать после подтверждения
      * @public
      */
     showConfirmWindow : function (message, callback, cancel_callback)
       {
        var win = this.showWindow(View.windowTitle, {width : 320, height : 136}),
            on_select, on_cancel,
            text, ok_button, cancel_button;
        //---
        text = createNode('div');
        setStyleForNode(text, 'padding', '20px');
        addNode(text, createText(message));
        addNode(win, text);
        //---
        ok_button = createNode('button');
        setStyleForNode(ok_button,{'width':'80px','marginRight':'3px'});
        addEventListenerForNode(ok_button, 'click', on_select = function ()
          {
           removeEventListenerForNode(ok_button, 'click', on_select);
           removeEventListenerForNode(cancel_button, 'click', on_cancel);
           //---
           View.hideWindow();
           //---
           callback();
          });
        addNode(ok_button,createText(lng('QUESTION_YES')));
        addNode(win, ok_button);
        //---
        cancel_button = createNode('button');
        setStyleForNode(cancel_button,{'width':'80px','marginLeft':'3px'});
        addEventListenerForNode(cancel_button, 'click', on_cancel = function ()
          {
           removeEventListenerForNode(ok_button, 'click', on_select);
           removeEventListenerForNode(cancel_button, 'click', on_cancel);
           //---
           View.hideWindow();
           //---
           if(cancel_callback) cancel_callback();
          });
        addNode(cancel_button,createText(lng('QUESTION_NO')));
        addNode(win, cancel_button);
        //---
        try { ok_button.focus(); } catch(a) {}
       },
     /**
      * Метод показывает страницу входа
      * @param {Number} config Конфигурация полей
      * @param {Boolean} showGroups Флаг указывает показывать ли выпадающие списки для выбора групп и топиков
      * @public
      */
     showLoginPage : function (config, showGroups)
       {
        if(!config) config = 0;
        //---
        var page = createNode('div'), title, line, text,
            disabled = Model.digital_signature && Model.digital_signature !== '',
            dis = 'disabled';
        //---
        clearNode(body);
        setClassNameForNode(page, 'login');
        addNode(body, page);
        //---
        title = createNode('div');
        setClassNameForNode(title, 'title');
        addNode(title, createText(lng('LOGIN_TITLE')));
        addNode(page, title);
        //---
        login_name = createNode('input');
        setAttributeForNode(login_name, { 'name' : 'name', 'type' : 'text', value : Model.name || ''});
        addNode(page, getInputGroup(login_name, lng('LOGIN_NAME') + ':'));
        addEventListenerForNode(login_name, { 'keydown' : onLoginInputChange, 'keyup' : onLoginInputChange, 'reset' : onLoginInputChange });
        if(disabled) setAttributeForNode(login_name, dis, dis);
        //---
        if((config & 8) !== 0)
          {
           login_email = createNode('input');
           setAttributeForNode(login_email, { 'name' : 'email', 'type' : 'text', value : Model.email || '' });
           addNode(page, getInputGroup(login_email, lng('LOGIN_EMAIL') + ':'));
           addEventListenerForNode(login_email, { 'keydown' : onLoginInputChange, 'keyup' : onLoginInputChange, 'reset' : onLoginInputChange });
           if(disabled) setAttributeForNode(login_email, dis, dis);
          }
        //---
        if((config & 1) !== 0)
          {
           login_phone = createNode('input');
           setAttributeForNode(login_phone, { 'name' : 'phone', 'type' : 'text', value : Model.phone || ''});
           addNode(page, getInputGroup(login_phone, lng('LOGIN_PHONE') + ':'));
           addEventListenerForNode(login_phone, { 'keyup' : onLoginInputChange });
          }
        //---
        if((config & 2) !== 0)
          {
           login_company = createNode('input');
           setAttributeForNode(login_company, { 'name' : 'company', 'type' : 'text', value : Model.company || ''});
           addNode(page, getInputGroup(login_company, lng('LOGIN_COMPANY') + ':'));
           addEventListenerForNode(login_company, { 'keyup' : onLoginInputChange });
          }
        //---
        if((config & 4) !== 0)
          {
           login_account = createNode('input');
           setAttributeForNode(login_account, { 'name' : 'account', value : Model.account || '' });
           addNode(page, getInputGroup(login_account, lng('LOGIN_ACCOUNT') + ':'));
           addEventListenerForNode(login_account, { 'keydown' : onLoginInputChange, 'keyup' : onLoginInputChange, 'reset' : onLoginInputChange });
           if(disabled) setAttributeForNode(login_account, dis, dis);
          }
        //---
        if(showGroups)
          {
           var icon, arr, sel = 'selected';
           //---
           login_groups = createNode('select');
           setAttributeForNode(login_groups, { name : 'groups' });
           addNode(page, getInputGroup(login_groups, lng('LOGIN_GROUP') + ':'));
           addEventListenerForNode(login_groups, 'change', onLoginGroupChange);
           //---
           arr = Model.groups;
           if(arr)
             {
              var def = (Model.default_group || '').toLowerCase(), option;
              for(var i=0, j=arr.length, g; i<j; i++)
                {
                 g = arr[i];
                 if(g)
                   {
                    option = createNode('option');
                    setAttributeForNode(option, 'value', g.id);
                    addNode(option, createText(g.name + ' - ' + (g.online ? 'Online' : 'Offline')));
                    addNode(login_groups, option);
                    //---
                    if(def && g.name.toLowerCase().indexOf(def) > -1)
                      setAttributeForNode(option, sel, sel);
                   }
                }
             }
           //---
           login_topics = createNode('select');
           setAttributeForNode(login_topics, { name : 'topics', 'disabled' : dis });
           addNode(page, line = getInputGroup(login_topics, lng('LOGIN_TOPIC') + ':'));
           //---
           icon = createNode('img');
           setAttributeForNode(icon, {'src' : files + 'i/loader.gif', 'alt' : '', 'title' : ''});
           addNode(line, icon);
           //---
           onLoginGroupChange.call(login_groups);
          }
        //---
        login_enter = createNode('button');
        setAttributeForNode(login_enter, { 'disabled' : dis});
        addNode(login_enter, createText(lng('LOGIN_ENTER')));
        addEventListenerForNode(login_enter, 'click', onLoginEnterClick);
        addNode(page, line = getInputGroup(login_enter));
        //
        icon = createNode('img');
        setAttributeForNode(icon, {'src' : files + 'i/loader.gif', 'alt' : '', 'title' : ''});
        addNode(line, icon);
        //---
        if(Model.login_text)
          {
           text = createNode('div');
           addNode(text, createText(Model.login_text));
           setClassNameForNode(text, 'info');
           addNode(page, text);
          }
        //---
        setStyleForNode(page, 'marginTop', '-' + Math.round(page.offsetHeight * .5) + 'px');
        //---
        onLoginInputChange.call(login_name);
        //---
        if(Model.autologin===true) onLoginEnterClick.call(login_enter);
       },
     /**
      * Метод показывает ошибку, которая происходит во время входа в чат
      * @public
      */
     showLoginError : function ()
       {
        var dis = 'disabled',
            sing = Model.digital_signature && Model.digital_signature !== '';
        //---
        if(login_enter)
          {
           removeAttributeFromNode(login_enter, dis, dis);
           setClassNameForNode(login_enter.parentNode, 'error');
           setStyleForNode(login_enter.nextSibling, 'display','none');
          }
        //---
        if(login_name && !sing) removeAttributeFromNode(login_name, dis, dis);
        if(login_email && !sing) removeAttributeFromNode(login_email, dis, dis);
        if(login_account && !sing) removeAttributeFromNode(login_account, dis, dis);
        //---
        if(login_phone) removeAttributeFromNode(login_phone, dis, dis);
        if(login_company) removeAttributeFromNode(login_company, dis, dis);
        //---
        if(login_groups) removeAttributeFromNode(login_groups, dis, dis);
        if(login_topics && login_topics.value) removeAttributeFromNode(login_topics, dis, dis);
       },
     /**
      * Метод обновляет список тем
      * @param {Boolean} isError Это сообщение об ошибке
      * @public
      */
     updateLoginTopics : function (isError)
       {
        if(login_topics)
          {
           var dis = 'disabled', sel = 'selected';
           //---
           login_topics.value = '';
           setClassNameForNode(login_topics.parentNode, 'error', true);
           setClassNameForNode(login_topics.parentNode, 'loading', true);
           //---
           clearNode(login_topics);
           setAttributeForNode(login_topics, dis, dis);
           //---
           if(isError === true)
             {
              setClassNameForNode(login_topics.parentNode, 'error');
              return;
             }
           //---
           var arr = Model.topics;
           if(arr && arr.length)
             {
              removeAttributeFromNode(login_topics, dis);
              //--
              var def = String(Model.default_topic || '').toLowerCase(), option;
              for (var i=0, j=arr.length, t; i<j; i++)
                {
                 t = arr[i];
                 if(t)
                   {
                    option = createNode('option');
                    setAttributeForNode(option, 'value', t.name);
                    addNode(option,createText(t.name));
                    addNode(login_topics, option);
                    //---
                    if(def && t.name.toLowerCase().indexOf(def) > -1)
                      setAttributeForNode(option, sel, sel);
                   }
                }
             }
          }
       },
     /**
      * Метод производит валидацию полей на странице входа
      * @param {HTMLInputElement} input Ссылка на элемент поля
      * @param {String} type Тип проверки
      * @public
      */
     checkLoginInputs : function (input, type)
       {
        if(input)
          {
           if(type == 'empty')
             {
              setClassNameForNode(input, 'invalid', input.value !== '');
              return(input.value !== '');
             }
           //---
           if(type == 'email')
             {
              var pattern = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/,
                  result;
              //---
              if(input.value) result = pattern.test(input.value);
              else result = false;
              //---
              setClassNameForNode(input, 'invalid', result);
              return(result);
             }
          }
        //---
        return(false);
       },
     /**
      * Метод показывает страницу диалога
      * @public
      */
     showDialogPage : function ()
       {
        clearNode(body);
        //---
        var page = createNode('div');
        setClassNameForNode(page, 'dialog');
        addNode(body, page);
        //---
        var commands = createNode('div');
        setClassNameForNode(commands, 'commands');
        addNode(page, commands);
        //---
        var message = createNode('span');
        setClassNameForNode(message, 'network-messsage');
        addNode(commands, message);
        addNode(message, createText(lng('NET_STATUS')));
        //---
        var star = createNode('span');
        star.innerHTML = '&nbsp';
        //---
        dialog_score = createNode('span');
        setAttributeForNode(dialog_score, 'title', lng('RAITING_MESSAGE'));
        addNode(dialog_score, star);
        setClassNameForNode(dialog_score, 'score');
        addNode(commands, dialog_score);
        addEventListenerForNode(dialog_score, 'click', onDialogScoreClick);
        //---
        dialog_timer = createNode('span');
        setClassNameForNode(dialog_timer, 'timer');
        addNode(commands, dialog_timer);
        addNode(dialog_timer, createText('| 00:00:00 |'));
        //---
        dialog_close = createNode('a');
        setClassNameForNode(dialog_close, 'close');
        setAttributeForNode(dialog_close, 'href', 'javascript:void(0);');
        setAttributeForNode(dialog_close, 'title', lng('DIALOG_CLOSE_TITLE'));
        addNode(dialog_close, createText(lng('DIALOG_CLOSE')));
        addNode(commands, dialog_close);
        addEventListenerForNode(dialog_close, 'click', onDialogCloseClick);
        //---
        dialog_new = createNode('a');
        setClassNameForNode(dialog_new, 'new');
        setAttributeForNode(dialog_new, 'href', 'javascript:void(0);');
        setStyleForNode(dialog_new, 'display', 'none');
        addNode(dialog_new, createText(lng('DIALOG_NEW')));
        addEventListenerForNode(dialog_new, 'click', onDialogNewClick);
        addNode(commands, dialog_new);
        //---
        dialog_list = createNode('div');
        setClassNameForNode(dialog_list, 'list');
        addNode(page, dialog_list);
        //---
        if(Model.transfer_files && ((JSNOP.isMSIE() && JSNOP.ieVersion() > 8) || !JSNOP.isMSIE()))
          {
           dialog_file_form = createNode('form');
           setClassNameForNode(dialog_list, 'files');
           addNode(page, dialog_file_form);
           //---
           dialog_file_button = createNode('span');
           setClassNameForNode(dialog_file_button, 'but');
           dialog_file_button.innerHTML = '<span></span>' + lng('DIALOG_ATTACH');
           addNode(dialog_file_form, dialog_file_button);
           addEventListenerForNode(dialog_file_button, 'click', OnDialogFileButtonClick);
           //--
           dialog_file_input = createNode('div');
           addNode(dialog_file_form, dialog_file_input);
           //---
           dialog_file_loader = createNode('span');
           dialog_file_loader.innerHTML = '<img src="' + (files + 'i/loader.gif') + '" width="16" height="16">' + lng('FILE_SENDING');
           addNode(dialog_file_form, dialog_file_loader);
           //---
           OnDialogFileFormSend();
          }
        //---
        dialog_text_area = createNode('textarea');
        addNode(page, dialog_text_area);
        setStyleForNode(dialog_text_area, 'width', (dialog_list.offsetWidth - 6) + 'px');
        addEventListenerForNode(dialog_text_area, { 'keydown' : onDialogInputChange, 'keyup' : onDialogInputChange, 'reset' : onDialogInputChange });
        //---
        addEventListenerForNode(document.defaultView, 'resize', function ()
          {
           setStyleForNode(dialog_text_area, 'width', (dialog_list.offsetWidth - 6) + 'px');
          });
        //---
        dialog_send = createNode('button');
        setClassNameForNode(dialog_send, 'send');
        setAttributeForNode(dialog_send, 'title', lng('DIALOG_SEND_TITLE'));
        addNode(dialog_send, createText(lng('DIALOG_SEND')));
        addEventListenerForNode(dialog_send, 'click', onDialogSendClick);
        addNode(page, dialog_send);
        //
        if(top.window.clipboardData)
          {
           dialog_copy = createNode('button');
           setClassNameForNode(dialog_copy, 'copy');
           setAttributeForNode(dialog_copy, 'title', lng('DIALOG_COPY_TITLE'));
           addNode(dialog_copy, createText(lng('DIALOG_COPY')));
           addNode(page, dialog_copy);
           addEventListenerForNode(dialog_copy, 'click', onDialogCopyClick);
          }
        //---
        onDialogInputChange.call(dialog_text_area);
        //---
        Model.time = 0;
        //---
        clearInterval(dialog_interval);
        dialog_interval = setInterval(function ()
          {
           Model.time++;
           //---
           clearNode(dialog_timer);
           addNode(dialog_timer, createText(' | ' + getTimeBySecond(Model.time) + ' | '));
           //---
           if(Model.state == '3' || Model.state == '4')
             {
              clearInterval(dialog_interval);
             }
          }, 1000)
       },
     /**
      * Метод обновляет отображение диалога
      * @public
      */
     updateDialog : function ()
       {
        dialog_clipboard = '';
        //---
        var messages = Model.getMessages();
        if(messages)
          {
           var text = [], str, obj,
               id, time, date;
           //---
           dialog_clipboard = [];
           //---
           str = Model.welcome_message;
           if(str)
             {
              text.push('<div class="title welcome"><span class="icon"></span>',str,'</div>');
              dialog_clipboard.push(str);
             }
           //---
           for (var i=0, j=messages.length; i<j; i++)
             {
              obj = messages[i];
              if(obj)
                {
                 if(obj.date)
                   {
                    time = obj.date;
                    //---
                    if(obj.author_id != "3")
                      {
                       if (obj.author_id == id && getNextString(date, time))
                         {
                          text.push('<div>');
                          if(obj.attachments && obj.attachments.length) text.push(GetFileHTML(obj));
                          else text.push(getValidHTML(obj.message));
                          text.push('</div>');
                          //---
                          dialog_clipboard.push('\r\n' + getSafeString(obj.message));
                         }
                       else
                         {
                          dialog_clipboard.push('\r\n\r\n' + getSafeString(obj.author||'I') + ' | ' + getTimeString(time));
                          dialog_clipboard.push('\r\n' + getSafeString(obj.message));
                          //---
                          text.push('<div class="title ',getUserClassById(obj.author_id),'"><span class="icon"></span>',getSafeString(obj.author||'I'),'<span class="time"> | ',getTimeString(time),'</span></div>');
                          text.push('<div>');
                          if(obj.attachments && obj.attachments.length) text.push(GetFileHTML(obj));
                          else text.push(getValidHTML(obj.message));
                          text.push('</div>');
                          //---
                          id = obj.author_id;
                          date = time;
                         }
                      }
                    else
                      {
                       dialog_clipboard.push('\r\n\r\n' + getTimeString(time) + ' ' + getSafeString(getSystemMessageByType(obj.message, obj.type)));
                       //---
                       text.push('<div class="title ',(obj.type == 6 ? 'autoreply' : 'system'),'"><span class="icon"></span><span class="time">',getTimeString(time),'</span>',getSafeString(getSystemMessageByType(obj.message, obj.type)),'</div>');
                       //---
                       id = "-1";
                       date = -1;
                      }
                   }
                 else
                   {
                    if(obj.author)
                      {
                       if(obj.author_id == id)
                         {
                          dialog_clipboard.push('\r\n' + getSafeString(obj.message));
                          //---
                          text.push('<div>');
                          if(obj.attachments && obj.attachments.length) text.push(GetFileHTML(obj));
                          else text.push(getValidHTML(obj.message));
                          text.push('</div>');
                         }
                       else
                         {
                          dialog_clipboard.push('\r\n\r\n' + getSafeString(obj.author && obj.author != "" ? obj.author : "I"));
                          dialog_clipboard.push('\r\n' + getSafeString(obj.message));
                          //--
                          text.push('<div class="title ',getUserClassById(obj.author_id),'"><span class="icon"></span><span class="author">',getSafeString(obj.author && obj.author != "" ? obj.author : "I"),'</span></div>');
                          text.push('<div>');
                          if(obj.attachments && obj.attachments.length) text.push(GetFileHTML(obj));
                          else text.push(getValidHTML(obj.message));
                          text.push('</div>');
                          //---
                          id = obj.author_id;
                         }
                      }
                   }
                }
             }
           //---
           if(Model.typing)
             {
              text.push('<div class="typing">',lng('TYPING'),'...</div>');
             }
           //---
           clearNode(dialog_list);
           dialog_list.innerHTML = text.join('');
           dialog_list.scrollTop = dialog_list.scrollHeight;
           //--
           dialog_clipboard = dialog_clipboard.join('');
          }
        //---
        var state = Model.state;
        if(state == '3' || state == '4')
          {
           var dis = 'disabled',
               commands;
           //---
           setClassNameForNode(body, 'closed');
           setAttributeForNode(dialog_text_area, dis, dis);
           setAttributeForNode(dialog_send, dis, dis);
           //---
           if(dialog_close)
             {
              commands = dialog_close.parentNode;
              removeNode(dialog_close);
              dialog_close = null;
              //---
              var closed = createNode('span');
              setClassNameForNode(closed, 'closed');
              addNode(closed, createText(lng('DIALOG_COMPLETED')));
              addNode(commands, closed);
              //---
              closed = createNode('span');
              closed.innerHTML = '&nbsp;|&nbsp;';
              addNode(commands, closed);
              //---
              setStyleForNode(dialog_new, 'display', '');
              addNode(commands, dialog_new);
             }
           //---
           if(Model.score === 0 && !Model.without_window)
             {
              View.showScoreWindow(0, function (score)
                {
                 Controller.loadScore(score);
                });
             }
          }
        //---
        var score = parseInt(Model.score);
        if(!isNaN(score))
          {
           if(dialog_score)
             setStyleForNode(dialog_score.firstChild, 'width', (score * 14) + 'px');
          }
       },
     /**
      * Метод оповещает о том, что в диалоге произошли какие-то изменения
      * Смена статуса или новые сообщения
      * @public
      */
     notifyDialog : function ()
       {
        if(Chat.notify) Chat.notify();
       },
     /**
      * Метод показывает модальное окно для выбора оценки
      * @param {Number} score Текущая оценка
      * @param {Function} callback Функция, которую необходимо вызвать после установки
      * @public
      */
     showScoreWindow : function (score, callback)
       {
        this.hideWindow();
        //---
        var window = this.showWindow(View.windowTitle, {width : 360, height : 192}),
            on_select, on_cancel, slider,
            text, ok_button, cancel_button, on_mousedown, on_mousemove, on_mouseup,
            is_down;
        //---
        text = createNode('div');
        setStyleForNode(text,{'textAlign':'center','padding':'20px 10px 10px 10px' });
        addNode(text, createText(lng('RAITING_MESSAGE') + ':'));
        addNode(window, text);
        //---
        slider = createNode('span');
        setStyleForNode(slider,'marginBottom','20px');
        setClassNameForNode(slider, 'score');
        addEventListenerForNode(slider,
          {
           'mousedown' : on_mousedown = function (e)
             {
              if(e.preventDefault) e.preventDefault();
              //--
              is_down = true;
              on_mousemove(e);
              //---
              removeAttributeFromNode(ok_button, 'disabled');
              setClassNameForNode(slider.firstChild, 'select');
              //---
              addEventListenerForNode(document, 'mouseup', on_mouseup = function ()
                {
                 removeEventListenerForNode(document, 'mouseup', on_mouseup);
                 setClassNameForNode(slider.firstChild, 'select', true);
                 is_down = false;
                 setTimeout(function (){ ok_button.focus(); }, 100);

                })
             },
           'mousemove' : on_mousemove = function (e)
             {
              if(is_down)
                {
                 var node = slider, position = e.clientX;
                 while(node)
                   {
                    if(!isNaN(node.offsetLeft)) position -= node.offsetLeft;
                    node = node.parentNode;
                   }
                 //---
                 if(position <= 190)
                   setStyleForNode(slider.firstChild, 'width', (Math.ceil(position / 38) * 38) + 'px');
                }
             }
          });
        addNode(slider, createNode('span'));
        addNode(window, slider);
        addNode(window, createNode('div'));
        setStyleForNode(slider.firstChild, 'width',(38 * score) + 'px');
        //---
        ok_button = createNode('button');
        setAttributeForNode(ok_button, 'disabled', 'disabled');
        setStyleForNode(ok_button, {'width':'80px','marginRight':'3px'});
        addEventListenerForNode(ok_button, 'click', on_select = function ()
          {
           removeEventListenerForNode(ok_button, 'click', on_select);
           removeEventListenerForNode(cancel_button, 'click', on_cancel);
           removeEventListenerForNode(slider, { 'mousemove' : on_mousemove, 'mousedown' : on_mousedown });
           //---
           View.hideWindow();
           //---
           var width = slider.firstChild.style.width;
           width = parseInt(width.substr(0, width.length - 2));
           callback(Math.ceil(width / 38));
           //---
          });
        addNode(ok_button,createText('OK'));
        addNode(window, ok_button);
        //---
        cancel_button = createNode('button');
        setStyleForNode(cancel_button, {'width':'80px','marginLeft':'3px'});
        addEventListenerForNode(cancel_button, 'click', on_cancel = function ()
          {
           removeEventListenerForNode(ok_button, 'click', on_select);
           removeEventListenerForNode(cancel_button, 'click', on_cancel);
           removeEventListenerForNode(slider, { 'mousemove' : on_mousemove, 'mousedown' : on_mousedown });
           //---
           View.hideWindow();
          });
        addNode(cancel_button,createText(lng('LOGIN_CANCEL')));
        addNode(window, cancel_button);
       },
     /**
      * Метод показывает доступности сети
      * @param {Boolean} avaliable Доступность
      * @public
      */
     showNetworkStatus : function (avaliable)
       {
        var dis = 'disabled';
        //---
        setClassNameForNode(body, dis, avaliable);
        //---
        if(avaliable)
          {
           removeAttributeFromNode(dialog_close, dis);
           removeAttributeFromNode(dialog_score, dis);
           removeAttributeFromNode(dialog_send, dis);
           removeAttributeFromNode(dialog_text_area, dis);
          }
        else
          {
           setAttributeForNode(dialog_close, dis, dis);
           setAttributeForNode(dialog_score, dis, dis);
           setAttributeForNode(dialog_send, dis, dis);
           setAttributeForNode(dialog_text_area, dis, dis);
          }
       },
     /**
      * Возвращает текст, который не удалось отправить обратно в поле ввода
      * @param {String} text Текст
      * @public
      */
     returnSendText : function (text)
       {
        if(dialog_text_area.value) dialog_text_area.value += '\n' + text;
        else dialog_text_area.value = text;
       },
     /**
      * Метод сбрасывает кнопку выбора файла в прежнее состояние
      * @public
      */
     resetFile : function ()
       {
        if(dialog_file_form)
          OnDialogFileFormSend();
       }
    };
   /**
    *
    */
   /*********************************************
    * Приватные методы для различных вычислений *
    *********************************************/
   /**
    *
    */
   /**
    * Метод вовзвращает класс для заголовка сообщения
    * в зависимости от идентификатора автора
    * @param {String} id Идентификатор автора
    * @return {String} Имя класса
    * @private
    */
   function getUserClassById (id)
     {
      if(id === '0') return 'my';
      //---
      if (dialog_colors[id]) return dialog_colors[id];
      //---
      dialog_colors[id] = 'they-' + dialog_colors_count;
      //---
      dialog_colors_count++;
      if (dialog_colors_count == 4) dialog_colors_count = 0;
      //
      return dialog_colors[id];
     }
   /**
    * Метод возвращает разрешение на склеивание сообщений
    * @param {Number} startTime Время первого сообщения
    * @param {Number} endTime Время последнего
    * @return {Boolean} Разрешение
    * @private
    */
   function getNextString (startTime, endTime)
     {
      if(endTime > startTime)
        return((endTime - startTime) < 600000000);
      else if(endTime == startTime)
        return(true);
      else
        return(false);
     }
   /**
    * Метод собирает и возвращает системное сообщение
    * @param {String} message Содержимое
    * @param {String} type Тип сообщения
    * @return {String} Сообщение
    * @private
    */
   function getSystemMessageByType (message, type)
     {
      type = String(type);
      //---
      switch (type)
        {
         case '0':
           return(message + lng('SYSTEM_MESSAGE_JOIN'));
           break;
         case '1':
           return(message + lng('SYSTEM_MESSAGE_RECONNECT'));
           break;
         case '2':
           return(message + lng('SYSTEM_MESSAGE_CLOSE'));
           break;
         case '3':
           return(message + lng('SYSTEM_MESSAGE_LOST_CONNECTION'));
           break;
         case '4':
           return(lng('SYSTEM_MESSAGE_TIMEOUT'));
           break;
         case '6':
           return(message);
           break;
        }
      //---
      return message;
     }
   /**
    * Метод возвращает количество секунд в отформатированной строке
    * @param {Number} second Количество секунд
    * @return {String} Отформатированная строка
    * @private
    */
   function getTimeBySecond (second)
     {
      var hou = Math.floor(second / 3600),
      min = Math.floor((second - hou * 3600) / 60),
      sec = second - hou * 3600 - min * 60;
      //---
      return getTimeFormat(hou) + ":" + getTimeFormat(min) + ":" + getTimeFormat(sec);
     }
   /**
    * Метод проверяет текст на наличие ссылок
    * Вставляет элементы ссылки, если такие найдены
    * @param {String} html Исходный текст
    * @return {String} Проверенный текст
    * @private
    */
   function getValidHTML (html)
     {
      return(getSafeString(html)
        .replace(/([^\/\S]|^)(www[\S]+(\/|\b|$))/gim, '$1http://$2')
        .replace(/(ftp|http|https|file):\/\/[\S]+(\/|\b|$)/gim, '<a href="$&" target="_blank">$&</a>')
        .replace(/\r\n|\n|\r/g,'<BR />'));
     }
   /**
    * Метод вовзвращает строку со списков файлов прикрепленных в сообщении
    * @param {Object} obj Объект сообщения
    * @return {String}
    * @private
    */
   function GetFileHTML (obj)
     {
      var result = [],
      attachments = obj.attachments,
      file;
      //---
      if(attachments && attachments.length)
        {
         for(var i=0, j=attachments.length; i<j; i++)
           {
            file=attachments[i];
            if(file)
              {
               if(file.id)
                 {
                  result.push('<span class="attachment">');
                  result.push('<span class="icon">&nbsp;</span>');
                  result.push('<a href="',Controller.getServerURL(),'public/chat/download?id=',file.id,'" target="_blank">',getSafeString(file.name),'</a>');
                  result.push('<span class="size"> (',getSizeString(file.size),')</span>');
                  result.push('</span>');
                 }
               else
                 {
                  result.push('<span class="attachment">');
                  result.push('<span class="icon">&nbsp;</span>');
                  result.push(getSafeString(file.name));
                  result.push('</span>');
                 }
              }
           }
        }
      //---
      return(result.join(''));
     }
   /**
    * Метод проверяет строку на наличие запрещенных
    * Заменяет найденные символы спецсимволами
    * @param {String} string Исходная строка
    * @return {String} Безопасная строка
    * @private
    */
   function getSafeString (string)
     {
      if(typeof(string)!='string') return string;
      if(!string) return "";
      //---
      return string.replace(/(<|>|&)/g, function (str,p)
        {
         switch(p)
           {
            case '<':
              return '&lt;';
            case '>':
              return '&gt;';
            case '&':
              return '&amp;';
            case '"':
              return '&quote;';
            case '\'':
              return '&#39;';
            default:
              return '&#'+p.charCodeAt(0)+';';
           }
        });
     }
   /**
    * Метод извлекает из даты время и возвращает его в виде строки
    * @param {Date} date Объект даты
    * @return {String} Строка времени
    * @private
    */
   function getTimeString (date)
     {
      var dat = new Date(date / 10000 - 11644473600000),
      today = new Date(),
      result = getTimeFormat(dat.getHours()) + ":" + getTimeFormat(dat.getMinutes());
      if(dat.getDate() != today.getDate() || dat.getMonth() != today.getMonth() || dat.getFullYear() != today.getFullYear()) result = dat.getFullYear() + '.' + getTimeFormat(dat.getMonth() + 1) + '.' + getTimeFormat(dat.getDate()) + ' ' + result;
      return result;
     }
   /**
    * Метод добавляет нуль к числам меньше десяти
    * @param {Number} time Число
    * @return {String} Строка
    * @private
    */
   function getTimeFormat (time)
     {
      if(time < 10) return '0' + time;
      return time.toString();
     }
   /**
    * Метод создает и возвращает группу для страницы входа
    * @param {HTMLInputElement} input Ссылка на элемент ввода
    * @param {String} label Название для метки
    * @return {HTMLElement} Элемент группы
    * @private
    */
   function getInputGroup (input, label)
     {
      var group = createNode('div'),
          lab = createNode('label');
      //---
      setAttributeForNode(lab, 'for', input.name);
      addNode(lab, createText(label || ''));
      addNode(group, lab);
      addNode(group, input);
      //---
      return group;
     }
   /**
    * Метод возвращает строку с читабельным размером
    * @param {Number} size Количество байт
    * @return {String}
    * @private
    */
   function getSizeString (size)
    {
      function socr (num) { return Math.round(num*10) / 10; }
      //
      var str;
      //
      if(size > 1048576)
        str = [socr(size / 1048576),' ',lng('MB')].join('');
      else if(size > 1024)
        str = [socr(size / 1024),' ', lng('KB')].join('');
      else
        str = size + ' ' + lng('BYTE');
      //
      return(str);
    }
   /**
    *
    */
   /*********************************
    * Приватные обработчики событий *
    *********************************/
   /**
    *
    */
   /**
    * Метод обрабатывает событие изменения содержимого полей на странице входа
    * Задает состояние для кнопки входа
    * @private
    */
   function onLoginInputChange (e)
     {
      var result = true, dis = 'disabled';
      //--
      setAttributeForNode(login_enter, dis, dis);
      //---
      if(!View.checkLoginInputs(login_name, 'empty'))
         result = false;
      if(login_email && !View.checkLoginInputs(login_email, 'email'))
         result = false;
      if(login_account && !View.checkLoginInputs(login_account, 'empty'))
         result = false;
      //---
      if(result)
         removeAttributeFromNode(login_enter, 'disabled');
      //---
      result = checkAllowOffline();
      //---
      if(e && e.type == 'keyup' && e.keyCode == 13)
        {
         if(result)
            onLoginEnterClick.call(login_enter);
        }
     }
   /**
    * Метод обрабатывает событие нажатия на кнопку входа в чат
    * Лочит редактирование полей и выполняет соответсвующую команду у контроллера
    * @private
    */
   function onLoginEnterClick ()
     {
      if(this.disabled) return(false);
      //---
      var dis = 'disabled';
      //---
      var group_id = login_groups ? (login_groups.value || '') : Model.default_group_id;
      if(!isAllowOffline(group_id))
         return(false);
      //---
      Controller.loadEnter((login_name.value || ''),
                           login_email ? (login_email.value || '') : '',
                           login_company ? (login_company.value || '') : '',
                           login_phone ? (login_phone.value || '') : '',
                           login_account ? (login_account.value || '') : '',
                           group_id,
                           login_topics ? (login_topics.value || '') : Model.default_topic);
      //---
      if(login_name) setAttributeForNode(login_name, dis, dis);
      if(login_email) setAttributeForNode(login_email, dis, dis);
      if(login_company) setAttributeForNode(login_company, dis, dis);
      if(login_phone) setAttributeForNode(login_phone, dis, dis);
      if(login_account) setAttributeForNode(login_account, dis, dis);
      if(login_groups) setAttributeForNode(login_groups, dis, dis);
      if(login_topics) setAttributeForNode(login_topics, dis, dis);
      //---
      setClassNameForNode(this.parentNode, 'error', true);
      setAttributeForNode(this, dis, dis);
      setStyleForNode(this.nextSibling, 'display','inline');
     }
   /**
    * Метод обрабатывает событие изменения группы на странице входа
    * Показывает предлопдер и загружает список тем для группы
    * @private
    */
   function onLoginGroupChange (e)
     {
      setClassNameForNode(login_topics.parentNode, 'error', true);
      setClassNameForNode(login_topics.parentNode, 'loading');
      Controller.loadTopics(login_groups.value);
      //---
      checkAllowOffline();
     }
   /**
    * Метод возвращает доступность создания оффлайн чата
    * @private
    */
   function isAllowOffline (group_id)
     {
      if(group_id && Model && Model.groups)
        {
         for(var i=0, j=Model.groups.length, g; i<j; i++)
           {
            var g = Model.groups[i];
            if(g && g.id == group_id && (g.allow_offline === undefined || (g.allow_offline !== undefined && g.allow_offline == 1)))
               return(true);
           }
        }
      //---
      return(false);
     }
   /**
    * Метод проверяют и задает возможность начать чат
    * @private
    */
   function checkAllowOffline ()
     {
      var result = true;
      //---
      if(login_enter && login_groups)
        {
         var dis = 'disabled';
         var group_id = login_groups ? (login_groups.value || '') : Model.default_group_id;
         //---
         if(isAllowOffline(group_id))
           {
            result = true;
            removeAttributeFromNode(login_enter, dis);
           }
         else
           {
            result = false;
            setAttributeForNode(login_enter, dis, dis);
           }
        }
      //---
      return(result);
     }
   /**
    * Метод обрабатывает событие изменения содержимого поля ввода сообщения
    * Задает состояние для кнопки "Отправить"
    * @param {Event} e Событие
    * @private
    */
   function onDialogInputChange (e)
     {
      var dis = 'disabled';
      if(this.value === '') setAttributeForNode(dialog_send, dis, dis);
      else removeAttributeFromNode(dialog_send, dis);
      //---
      if(e && e.type == 'keydown' && e.ctrlKey && e.keyCode == 83)
        {
         e.preventDefault();
        }
      //---
      if(e && e.type == 'keydown' && e.keyCode == 13 && e.ctrlKey)
        {
         if(!dialog_send.disabled)
           {
            onDialogSendClick.call(dialog_send);
            return;
           }
        }
      //---
      if(e)
        {
         Model.typing_time = timeToInt64(new Date().getTime());
         Model.typing_count = this.value.length;
        }
     }
   /**
    * Метод обрабатывает событие нажатия на кнопку "Отправить"
    * Отправляет сообщение на сервер
    * @private
    */
   function onDialogSendClick ()
     {
      if(dialog_text_area.value)
        {
         Model.typing_time = '0';
         Model.typing_count = 0;
         //---
         Controller.loadSend(dialog_text_area.value);
         //---
         dialog_text_area.value = '';
         onDialogInputChange.call(dialog_text_area);
         //---
         View.updateDialog();
         setTimeout(function ()
           {
            dialog_text_area.focus();
           }, 10);
        }
     }
   /**
    * Метод обрабатывает событие нажатия на кнопку завершения чата
    * Выполняет запрос на закрытие чата
    * @private
    */
   function onDialogCloseClick ()
     {
      var close = function ()
        {
         Controller.loadClose();
        };
      //---
      if(Model.without_window === true)
        {
         close();
         return(false);
        }
      //---
      View.showConfirmWindow(lng('CLOSE'), close);
      return(false);
     }
   /**
    * Метод обрабатывает событие нажатия на кнопку изменения оценки
    * Показывает коно для изменения оценки
    * @private
    */
   function onDialogScoreClick (e)
     {
      if(Model.without_window === true)
        {
         var node=dialog_score,
             position=e.clientX,
             score;
         //---
         while(node)
           {
            if(!isNaN(node.offsetLeft)) position-=node.offsetLeft;
            node=node.offsetParent;
           }
         //---
         score = Math.ceil(position / 14);
         //---
         if(score > 0) setAttributeForNode(dialog_score, 'title', lng('RAITING'));
         else setAttributeForNode(dialog_score, 'title', lng('RAITING_MESSAGE'));
         //---
         Controller.loadScore(score);
         return;
        }
      //---
      View.showScoreWindow(Model.score || 0, function (score)
        {
         Controller.loadScore(score);
        });
     }
   /**
    * Метод обрабатывает событие нажатия на кнопку копирования текста
    * Копирует текст диалога в буфер обмена
    * @private
    */
   function onDialogCopyClick ()
     {
      top.window.clipboardData.setData('Text', dialog_clipboard);
     }
   /**
    * Метод обрабатывает событие нажатия на кнопку нового диалога
    * Открывает страницу логина
    * @private
    */
   function onDialogNewClick ()
     {
      setClassNameForNode(body, 'closed', true);
      Model.clear();
      Controller.restart();
     }
   /**
    * Метод обрабатывает событие нажатия на кнопку добавления файла
    * Показывает контрол для выбора файла прчет кнопку
    * @private
    */
   function OnDialogFileButtonClick ()
     {
      dialog_file_input.innerHTML = '<input type="file" name="attachments"/>';
      addEventListenerForNode(dialog_file_input.firstChild, 'change', OnDialogFileInputChange);
      setStyleForNode(dialog_file_input, 'display', '');
      setStyleForNode(dialog_file_button, 'display', 'none');
     }
   /**
    * Метод обрабатывает событие выбора файла
    * Отправляет файл
    */
   function OnDialogFileInputChange ()
     {
      setStyleForNode(dialog_file_input, 'display', 'none');
      setStyleForNode(dialog_file_loader, 'display', '');
      //---
      var filename = dialog_file_input.firstChild.value;
      //---
      if(filename.indexOf('\\'))
        filename = filename.substr(filename.lastIndexOf('\\') + 1);
      //---
      try
        {
         if(dialog_file_input.firstChild.files && dialog_file_input.firstChild.files[0])
           filename = dialog_file_input.firstChild.files[0].name;
        }
      catch (a) {}
      //---
      Controller.uploadFile(dialog_file_form, filename);
      View.updateDialog();
     }
   /**
    * Метод обрабатывает событие успешной отправки файла
    * Задает контролам выбора файла первоначальное состояние
    * @private
    */
   function OnDialogFileFormSend ()
     {
      setStyleForNode(dialog_file_button, 'display', '');
      setStyleForNode(dialog_file_input, 'display', 'none');
      dialog_file_input.innerHTML = '';
      setStyleForNode(dialog_file_loader, 'display', 'none');
     }
  })();
/**
 * Объект управляющий логикой диалога
 * @public
 */
var Controller;
(function ()
  {
   /**
    *
    */
   /***********************
    * Приватные константы *
    ***********************/
   /**
    *
    */
   /**
    * Максимальное время жзни диалога после потери связи
    * @private
    * @constant
    */
   var MAX_LIFE_TIME_AFTER_DISCONNECT = 3900000,
   /**
    * Настройки тайматов для запросов новых сообщений
    * @private
    * @constant
    */
   DEFAULT_RECEIVE_TIMEOUT = 5000,
   STEP_RECIEVE_TIMEOUT = 1000 * 30,
   MAX_RECEIVE_TIMEOUT = 1000 * 60 * 5,
   /**
    * Использовать новый метод обмена сообщениями с помощью даты последнего обновления
    * @private
    * @constant
    */
   USE_TID_METHOD = true;
   /**
    *
    */
   /**********************
    * Приватные свойства *
    **********************/
   /**
    *
    */
   var url,           // Адрес сервера
   temp_settings,     // Ссылка на временного хранения настроек
   net_avaliable,     // Доступности сети
   restore,           // Флаг, указывающий что диалог возобновляемый
   last_index,        // Индекс последнего сообщения
   timeout,           // Таймаут запросов на сервер
   recieve_timeout,   // Текущий таймаут для запросов на сервер
   last_success_time, // Время последнего успешного соединения с сервером
   files,             // Путь к директории с файлами проекта
   last_tid;          // New. Время последнего обновления диалога
   //
   /**
    *
    */
   /********************
    * Публичные методы *
    ********************/
   /**
    *
    */
   Controller =
     {
     /**
      * Метод начинает работу чата
      * @param {Object} settings Предписанные настройки
      * @public
      */
     start : function (settings)
       {
        net_avaliable = true;
        recieve_timeout = DEFAULT_RECEIVE_TIMEOUT;
        //---
        if(!settings || !settings.url) return View.showMessage(lng('LOGIN_INPUT_ERROR'), 'error');
        temp_settings = settings;
        //---
        var has_local_storage = typeof(localStorage) != 'undefined';
        //---
        url = settings.url;
        //---
        if(settings.name)     Model.name = settings.name;
        if(settings.email)    Model.email = settings.email;
        if(settings.phone)    Model.phone = settings.phone;
        if(settings.company)  Model.company = settings.company;
        if(settings.account)  Model.account = settings.account;
        //---
        if(settings.group)    Model.default_group = settings.group;
        if(settings.topic)    Model.default_topic = settings.topic;
        //---
        if(settings.digital_signature)  Model.digital_signature = settings.digital_signature;
        if(settings.autologin)          Model.autologin = settings.autologin;
        //---
        if(settings.without_window === true) Model.without_window = true;
        if(settings.login_text)              Model.login_text = settings.login_text;
        //---
        if(settings.cache === true)
          {
           var item;
           //---
           Model.cache = settings.cache;
           //---
           if(Chat.getLocal)
             {
              //if(!Model.name && (item = Chat.getLocal('name'))) Model.name = item;
              //if(!Model.email && (item = Chat.getLocal('email'))) Model.email = item;
              //if(!Model.phone && (item = Chat.getLocal('phone'))) Model.phone = item;
              //if(!Model.company && (item = Chat.getLocal('company'))) Model.company = item;
              //if(!Model.account && (item = Chat.getLocal('account'))) Model.account = item;
              //---
              if(item = Chat.getLocal('name'))    Model.name = item;
              if(item = Chat.getLocal('email'))   Model.email = item;
              if(item = Chat.getLocal('phone'))   Model.phone = item;
              if(item = Chat.getLocal('company')) Model.company = item;
              if(item = Chat.getLocal('account')) Model.account = item;
             }
           else if (has_local_storage)
             {
              //if(!Model.name && (item = localStorage.getItem('name'))) Model.name = item;
              //if(!Model.email && (item = localStorage.getItem('email'))) Model.email = item;
              //if(!Model.phone && (item = localStorage.getItem('phone'))) Model.phone = item;
              //if(!Model.company && (item = localStorage.getItem('company'))) Model.company = item;
              //if(!Model.account && (item = localStorage.getItem('account'))) Model.account = item;
              //---
              if(item = localStorage.getItem('name'))     Model.name = item;
              if(item = localStorage.getItem('email'))    Model.email = item;
              if(item = localStorage.getItem('phone'))    Model.phone = item;
              if(item = localStorage.getItem('company'))  Model.company = item;
              if(item = localStorage.getItem('account'))  Model.account = item;
             }
          }
        //---
        files = '';
        if(settings.files) files = settings.files;
        //---
        var session_id = (Chat.getLocal && Chat.getLocal('session_id')) || (has_local_storage && localStorage.getItem('session_id'));
        if(session_id)
          {
           Controller.loadRestore(session_id);
           return;
          }
        //---
        if(!isNaN(settings.group_id))
          {
           Model.default_group_id = settings.group_id;
		   Model.groups = settings.groups;
		   //---
           View.showLoginPage(settings.config, false);
          }
        else
          {
           this.loadGroup(settings.filter);
          }
       },
     /**
      * Метод рестартует работу чата
      * @public
      */
     restart : function ()
       {
        clearTimeout(timeout);
        Controller.start(temp_settings);
       },
     /**
      * Метод начинает каждые 5 минут оправшивать сервер на наличие новых сообщений
      * Вызывается при переходе на страницу диалога
      * @public
      */
     startDialog : function ()
       {
        last_index = -1;
        last_tid = '0';
        this.loadMessages();
       },
     /**
      * Метод прекращает каждые пять минут опрашивать сервер на наличие новых сообщений
      * Вызывается при получении соответсвующего статуса
      * @public
      */
     stopDialog : function ()
       {
        clearTimeout(timeout);
       },
     /**
      * Метод загружает список групп
      * @param {String} filter Фильтр для групп
      * @public
      */
     loadGroup : function (filter)
       {
        View.showLoading();
        JSNOP.get(url + 'public/chat/groups', { filter : filter }, '1', function ()
          {
           View.showMessage(lng('ERROR'), 'net-error', function ()
             {
              Controller.loadGroup(filter);
             })
          });
       },
     /**
      * Метод загружает список тем для группы
      * @param {String} groupId Идентификатор группы
      * @public
      */
     loadTopics : function (groupId)
       {
        JSNOP.get(url + 'public/chat/topics', { group_id : groupId }, '1', function ()
          {
           net_avaliable = false;
           View.updateLoginTopics(true);
          });
       },
     /**
      * Метод выполняет запрос на вход в чат
      * @param {String} name Имя
      * @param {String} email Электронная почта
      * @param {String} company Компания
      * @param {String} phone Телефон
      * @param {String} account Счет
      * @param {String} group Группа
      * @param {String} topic Тема
      * @public
      */
     loadEnter : function (name, email, company, phone, account, group, topic)
       {
        JSNOP.post(url + 'public/chat/request/',
          {
           name : name,
           email : email,
           company : company,
           phone : phone,
           account : account,
           group_id : group,
           topic : topic,
           digital_signature : Model.digital_signature
          }, files + 'html/enter.html', function ()
          {
           View.showLoginError();
          });
        //---
        if(Model.cache)
          {
           if(Chat.setLocal)
             {
              if(name) Chat.setLocal('name', name);
              if(email) Chat.setLocal('email', email);
              if(phone) Chat.setLocal('phone', phone);
              if(company) Chat.setLocal('company', company);
              if(account) Chat.setLocal('account', account);
             }
           else if (typeof(localStorage) != 'undefined')
             {
              if(name) localStorage.setItem('name', name);
              if(email) localStorage.setItem('email', email);
              if(phone) localStorage.setItem('phone', phone);
              if(company) localStorage.setItem('company', company);
              if(account) localStorage.setItem('account', account);
             }
          }
        //---
        if(Chat.onEnterComplete) Chat.onEnterComplete();
       },
     /**
      * Метод выполняет отправку сообщения
      * @param {String} message Сообщение
      * @public
      */
     loadSend : function (message)
       {
        var obj = { };
        obj.message = message;
        obj.author_id = Model.user_id;
        obj.author = Model.name;
        obj.sended = false;
        Model.temp.push(obj);
        //---
        JSNOP.post(url + 'public/chat/send',
          {
           'session_id' : Model.session_id,
           'message' : message
          }, files + 'html/send.html', function ()
          {
           Model.temp[getTempObjectByMessage(obj)] = null;
           //---
           View.returnSendText(message);
           View.updateDialog();
           //---
           net_avaliable = false;
           View.showNetworkStatus(false);
          });
       },
     /**
      * Метод выполняет запрос на закрытие чата
      * @public
      */
     loadClose : function ()
       {
        JSNOP.get(url + 'public/chat/close', { 'session_id' : Model.session_id }, '1');
       },
     /**
      * Метод загружает информацию о возможности восстановления диалога
      * @param {String} session_id Идентификатор сессии диалога
      * @public
      */
     loadRestore : function (session_id)
       {
        View.showLoading();
        JSNOP.get(url + 'public/chat/restore', { session_id : session_id }, '1', function ()
          {
           View.showMessage(lng('ERROR'), 'net-error', function ()
             {
              Controller.loadRestore(session_id);
             })
          });
       },
     /**
      * Метод загружает список сообщений
      * @param {Number} rate Оценка
      * @private
      */
     loadMessages : function (rate)
       {
        if(new Date().getTime() - last_success_time > MAX_LIFE_TIME_AFTER_DISCONNECT)
          {
           if(window.localStorage && window.localStorage.removeItem)
             window.localStorage.removeItem('session_id');
           //---
           Model.clear();
           Controller.restart();
           //---
           return;
          }
        //---
        var params = {};
        //---
        params.session_id = Model.session_id;
        //---
        if(restore)
          params.force = '';
        //---
        if(rate && rate > -1)
          params.score = rate;
        //---
        if(USE_TID_METHOD) params.tid = last_tid;
        else params.from = (net_avaliable ? Model.messages.length : 0);
        //---
        params.today = timeToInt64(new Date().getTime());
        //---
        if(Model.typing_time)
          params.typing = [Model.typing_time, Model.typing_count].join(';');
        //---
        JSNOP.get(url + 'public/chat/receive', params, '1', function ()
          {
           net_avaliable = false;
           recieve_timeout = Math.min(recieve_timeout + STEP_RECIEVE_TIMEOUT, MAX_RECEIVE_TIMEOUT);
           //---
           View.showNetworkStatus(false);
           //---
           clearTimeout(timeout);
           timeout=setTimeout(function ()
             {
              if (!getClosed())
                Controller.loadMessages(rate)
             }, recieve_timeout);
          })
       },
     /**
      * Метод выполняет запрос на изменение оценки диалога
      * @param {Number} score Оценка
      * @public
      */
     loadScore : function (score)
       {
        this.loadMessages(score);
       },
     /**
      * Метод отправляет форму
      * @param {HTMLFormElement} form Элемент формы с файлом
      * @public
      */
     uploadFile : function (form, fileName)
       {
        var obj = { };
        obj.message = fileName;
        obj.author_id = Model.user_id;
        obj.author = Model.name;
        obj.sended = false;
        obj.attachments = [ { name : fileName }];
        Model.temp.push(obj);
        //---
        JSNOP.post(url + 'public/chat/send',
          {
           'session_id' : Model.session_id
          },
          files + 'html/file.html',
          function ()
            {
             Model.temp[getTempObjectByMessage(obj)] = null;
             //---
             View.resetFile();
             View.updateDialog();
             //---
             net_avaliable = false;
             View.showNetworkStatus(false);
            },
          form);
       },
     /**
      * Метод возвращает серверный урл
      * @return {String}
      * @private
      */
     getServerURL : function ()
       {
        return(url);
       },
     /**
      * Метод обрабатывает событие успешной загрузки групп
      * @param {Object} data Список групп
      * @private
      */
     onGroupsLoaded : function (data)
       {
        Model.groups = data.groups;
        View.showLoginPage(data.config, true);
       },
     /**
      * Метод обрабатывает событие успешной загрузки тем
      * @param {Object} data Список тем
      * @private
      */
     onTopicsLoaded : function (data)
       {
        Model.topics = data;
        View.updateLoginTopics();
       },
     /**
      * Метод обрабатывает событие успешного входа в чат
      * @param {Object} data Данными входа (Идентификатор диалога и приветсвие)
      * @private
      */
     onEnterComplete : function (data)
       {
        last_success_time = new Date().getTime();
        //---
        Model.session_id = data.session_id;
        Model.welcome_message = data.welcome || lng('WELCOME_MESSAGE');
        Model.transfer_files = data.transfer_files === true;
        //---
        if(Chat.setLocal)
          {
           Chat.setLocal('session_id', Model.session_id);
          }
        else if (typeof(localStorage) != 'undefined')
          {
           localStorage.setItem('session_id', Model.session_id);
          }
        //---
        View.showDialogPage();
        Controller.startDialog();
       },
     /**
      * Метод обрабатывает событие успешной загрузки запроса на восстановление диалога
      * @param {Object} data Данные
      * @private
      */
     onRestoreLoaded : function (data)
       {
        var has_local_storage = typeof(localStorage) != 'undefined', session_id;
        //---
        if(Chat.getLocal)
          {
           session_id = Chat.getLocal('session_id');
           Chat.removeLocal('session_id');
          }
        else if (has_local_storage)
          {
           session_id = localStorage.getItem('session_id');
           localStorage.removeItem('session_id');
          }
        //---
        if(data.restore === 1)
          {
           View.showConfirmWindow(lng('RESTORE'), function ()
             {
              Model.name = data.author;
              Model.session_id = session_id;
              Model.welcome_message = data.welcome || lng('WELCOME_MESSAGE');
              Model.transfer_files = data.transfer_files === true;
              //---
              restore = true;
              //---
              Controller.startDialog();
              //---
              View.showDialogPage();
              View.updateDialog();
              //---
              if(Chat.setLocal) Chat.setLocal('session_id', session_id);
              else if (has_local_storage) localStorage.setItem('session_id', session_id);
              //---
              last_success_time = new Date().getTime();
             },
             function ()
             {
              if(temp_settings.autologin)
                Controller.start(temp_settings);
             });
          }
        //---
        if(!temp_settings.autologin)
          Controller.start(temp_settings);
       },
     /**
      * Метод обрабатывает событие успешного запроса сообщений
      * @param {Object} data Список сообщений
      * @param {Number} from Индекс первого сообщения в списке
      * @private
      */
     onMessagesLoaded : function (data, from)
       {
        last_success_time = new Date().getTime();
        recieve_timeout = DEFAULT_RECEIVE_TIMEOUT;
        //---
        if(restore) restore = false;
        if(parseMessages(data, from))
          {
           clearTimeout(timeout);
           timeout=setTimeout(function ()
             {
              if (!getClosed())
                Controller.loadMessages()
             }, recieve_timeout);
          }
        //---
        if(!net_avaliable)
          {
           net_avaliable = true;
           View.showNetworkStatus(true);
          }
       },
     /**
      * Метод обрабатывает событие успешного закрытия чата
      * @public
      */
     onCloseComplete : function ()
       {
        last_success_time = new Date().getTime();
        //---
        Controller.loadMessages();
       }
    };
   /**
    *
    */
   /*********************************************
    * Приватные методы для различных вычислений *
    *********************************************/
   /**
    *
    */
   /**
    * Метод разбирает ответ со списком сообщений
    * @param {Object} data Данные
    * @param {Number} from Индекс первого сообщения
    * @return {Boolean} Разрешение выполнить запрос через интервал времени
    * @private
    */
   function parseMessages (data, from)
     {
      var update, notify, str, arr, ind, obj;
      //---
      update = false;
      //---
      if(from === 0)
        {
         Model.messages = [];
         Model.ids = {};
         last_index = -1;
        }
      //---
      if(data)
        {
         str = data.flags;
         if (str)
           {
            Model.messages = [];
            Model.ids = {};
            Model.temp = [];
            //---
            last_index = -1;
            last_tid = '0';
            //
            log("The flags is not empty! This means that they came all the messages!");
           }
         //---
         str = data.last_tid;
         if (str)
           {
            last_tid = str;
           }
         //---
         str = data.id;
         if(str)
           {
            Model.dialog_id = str;
           }
         //---
         str = String(data.user_id);
         if(str)
           {
            Model.user_id = str;
           }
         //---
         str = data.score;
         if(str || str === 0)
           {
            if(Model.score != Number(str))
              {
               update = true;
               Model.score = Number(str);
              }
           }
         //---
         str = String(data.state);
         if(str)
           {
            if(str != Model.state)
              update = true;
            //---
            Model.state = str;
            //---
            if(str == '4' || str == '3')
              {
               //Controller.stopDialog();
               View.updateDialog();
              }
           }
         //---
         str = data.typing;
         if (str !== undefined)
           {
            str = Boolean(str);
            if (str != Model.typing) update = true;
            Model.typing = str;
           }
         //---
         str = String(data.system_id);
         if(str)
           {
            if(Model.server_id)
              {
               if(str != Model.server_id)
                 {
                  Model.server_id = str;
                  //---
                  Model.messages = [];
                  Model.ids = {};
                  Model.temp = [];
                  //---
                  last_index = -1;
                  last_tid = '0';
                  //---
                  View.updateDialog();
                  log("TeamWox server was update!");
                  //---
                  Controller.loadMessages();
                  return(false);
                 }
              }
            else
              {
               Model.server_id = str;
              }
           }
         //---
         arr = data.messages;
         if(arr)
           {
            if(arr.length) update = true;
            //---
            for (var i=0, j=arr.length, m; i<j; i++)
              {
               m = arr[i];
               if(m)
                 {
                  if(!USE_TID_METHOD && m.index !== undefined)
                    {
                     ind = parseInt(m.index);
                     //---
                     if(i === 0)
                       {
                        if (ind === 0 && last_index >= 0)
                          {
                           log("The first message is of zero index! This means that they came all the messages!");
                           //---
                           Model.messages = [];
                           Model.ids = {};
                           Model.temp = [];
                           //---
                           last_index = -1;
                          }
                        //---
                        else if(ind != last_index + 1)
                          {
                           log("Post an unexpected index! Ask for all the posts from the beginning!");
                           //---
                           Model.messages = [];
                           Model.ids = {};
                           Model.temp = [];
                           //---
                           last_index = -1;
                           //---
                           View.updateDialog();
                           //---
                           Controller.loadMessages();
                           return(false);
                          }
                       }
                     //---
                     last_index = ind;
                    }
                  //---
                  if(m.date64 && Model.ids[m.date64]) continue;
                  //---
                  obj = { };
                  obj.date = Number(m.date);
                  obj.author_id = String(m.author_id);
                  obj.author = m.author || "";
                  obj.type = String(m.type);
                  obj.message = m.message || "";
                  obj.attachments = m.attachments;
                  //---
                  if (obj.author_id == "0")
                    {
                     //
                     // Еще раз запишем имя автора диалога
                     Model.name = obj.author;
                     //
                     // Определяем ссылку на временный объект сообщение
                     Model.temp[getTempObjectByMessage(obj)] = null;
                     //---
                     /**
                     var pro = getTempObjectByMessage(obj);
                     if (pro)
                       {
                        //
                        // Указываем ему что сообщение уже не времнное
                        pro.sended = true;
                       }
                     */
                    }
                  //---
                  if(obj.author_id == "3" && obj.message == "")
                    {
                     obj.message = lng('SYSTEM_MESSAGE_MANAGER');
                    }
                  //---
                  Model.messages.push(obj);
                  Model.ids[m.date64] = obj;
                  //---
                  if(obj.author_id && obj.author_id != Model.user_id)
                     notify = true;
                 }
              }
           }
         //---
         str = data.count;
         if(!USE_TID_METHOD && str !== undefined)
           {
            str = parseInt(str);
            if (str != last_index + 1)
              {
               log("Number of messages on the server does not match the number on the client!");
               //---
               Model.messages = [];
               Model.ids = {};
               Model.temp = [];
               //---
               last_index = -1;
               //---
               View.updateDialog();
               //---
               Controller.loadMessages();
               return(false);
              }
           }
        }
      //---
      if(update) View.updateDialog();
      if(notify) View.notifyDialog();
      //---
      return(true);
     }
   /**
    * Метод возвращает ссылку на временное сообщение
    * @param {String} message Текст сообщения
    * @return {Object} Ссылка на объект временного сообщения
    * @public
    */
   function getTempObjectByMessage (message)
     {
      var attachments = message.attachments,
      attachment;
      //---
      message = message.message;
      message = message.replace(/\r\n/ig, '\n');
      //---
      var arr = Model.temp;
      if (arr)
        {
         var str, fil;
         for (var j=arr.length, i = j - 1, m; i > -1; i--)
           {
            m = arr[i];
            if (m && m.message)
              {
               str = m.message.replace(/\r\n/ig, '\n');
               if(str == message)
                 return i;
              }
            //---
            if(attachments && attachments.length)
              {
               if(m.attachments && m.attachments.length)
                 {
                  fil = m.attachments[0];
                  if(fil)
                    {
                     str = fil.name;
                     //---
                     for(var a=0, b=attachments.length; a<b; a++)
                       {
                        attachment = attachments[a];
                        if(attachment && attachment.name == str)
                          return i;
                       }
                    }
                 }
              }
           }
        }
      //
      return null;
     }
   /**
    * Возвращает флаг закрытого состояния диалога
    * @return {Boolean} Флаг
    * @private
    */
   function getClosed ()
     {
      return (Model.state == "4" || Model.state == "3");
     }
  })();
/**
 * Объект управляющий обменом сообщений между фремами
 * @public
 */
var Context;
(function(){
/**
 *
 */
/********************
 * Публичные методы *
 ********************/
/**
 *
 */
Context =
  {
   /**
    * Метод добавляет обработчик события для примема сообщений от других фреймов
    * @public
    */
   init : function ()
     {
      if(has_frame_messager)
        {
         addEventListenerForNode(window, 'message', OnMessage);
        }
     }
  };
/**
 * Метод обрабатывает событие приема соообщения от другого фрейма
 * В зависимости от типа сообщения выполняет дальнейшие действия
 * @param {Event} e Событие
 * @private
 */
function OnMessage (e)
  {
   var data = getJSONByString(String(e.data));
   //---
   if(data.type == 'registr')
     {
      Chat.responseEnter(window.JSON.stringify(data.json));
      return;
     }
   //---
   if(data.type == 'send')
     {
      Chat.responseEnter(window.JSON.stringify(data.json));
      return;
     }
   //---
   if(data.type == 'file')
     {
      Chat.responseFile();
      return;
     }
  }
//---
})();
/**
 * Объект с публичными методами для взаимодействия
 * с шаблоном и скриптами ответов запросов
 * @public
 */
var Chat = window.Chat =
  {
   /**
    * Метод инициализирует работу чата
    * @param {HTMLElement} container Ссылка на элемент для чата
    * @param {Object} settings Объект с настройками
    * @public
    */
   init : function (container, settings)
     {
      if (!container) return alert('Input setting are not correct!');
      //---
      ChatLanguage.init(settings && settings.language);
      //---
      View.init(container, settings);
      JSNOP.init(container);
      Context.init();
      //---
      Controller.start(settings);
     },
   /**
    * Метод принимает данные групп
    * @param {String} scriptId Идентификатор скрипта
    * @param {Object} data Объект с данными
    * @public
    */
   responseGroups : function (scriptId, data)
     {
      Controller.onGroupsLoaded(data);
      JSNOP.onload(scriptId);
     },
   /**
    * Метод принимает данные тем
    * @param {String} scriptId Идентификатор скрипта
    * @param {Object} data Объект с данными
    * @public
    */
   responseTopics : function (scriptId, data)
     {
      Controller.onTopicsLoaded(data);
      JSNOP.onload(scriptId);
     },
   /**
    * Метод принимает данные для нового диалога
    * @param {Object} data Объект с данными
    * @public
    */
   responseEnter : function (data)
     {
      Controller.onEnterComplete(getJSONByString(data));
     },
   /**
    * Метод принимает подтверждение того что файл загружен
    * @public
    */
   responseFile : function ()
     {
      View.resetFile();
     },
   /**
    * Метод принимает данные о возможности возобновить диалог
    * @param {String} scriptId Идентификатор скрипта
    * @param {Object} data Объект с данными
    * @public
    */
   responseRestore : function (scriptId, data)
     {
      Controller.onRestoreLoaded(data);
      JSNOP.onload(scriptId);
     },
   /**
    * Метод принимает данные о возможности возобновить диалог
    * @param {String} scriptId Идентификатор скрипта
    * @param {Object} data Объект с данными
    * @public
    */
   responseMessages : function (scriptId, data, from)
     {
      Controller.onMessagesLoaded(data, from);
      JSNOP.onload(scriptId);
     },
   /**
    * Метод принимает данные после закрытия диалога
    * @param {String} scriptId Идентификатор скрипта
    * @param {Object} data Данные
    * @public
    */
   responseClose : function (scriptId, data)
     {
      Controller.onCloseComplete();
      JSNOP.onload(scriptId);
     }
  };
/**
 * Вспомогательные функции
 * Для более удобной работы с DOM-деревом и более высого сжатия
 * Используются повсеместно, поэтому на самом верхнем уровне
 */
/**
 * Метод создает элемент с заданным именем
 * @param {String} nodeName Имя элемента
 * @return {HTMLElement} Экземпляр элемента
 * @public
 */
function createNode (nodeName)
  {
   return document.createElement(nodeName);
  }
/**
 * Метод создает тектовый элемент
 * @param {String} text Содержимое
 * @return {HTMLElement} Экземпляр элемента
 * @public
 */
function createText (text)
  {
   return document.createTextNode(text);
  }
/**
 * Метод задает для элемента атрибут со значением
 * @param {HTMLElement} node Ссылка на элемент
 * @param {String|Object} name Имя атрибута | Объект описывающий атрибут - значение
 * @param {String} value Значение атрибута
 * @public
 */
function setAttributeForNode (node,name,value)
  {
   if(node)
     {
      if(typeof(name)=="object")
        {
         for(var i in name)
           {
            //if(node['setAttribute'])
              //node['setAttribute'](i, name[i])
            //else
              node[i] = name[i];
           }

        }
      if(typeof(name)=="string")
        {
         //if(node['setAttribute'])
           //node['setAttribute'](name,value);
         //else
           node[name] = value;
        }
     }
  }
/**
 * Метод удаляет атрибут у элемента
 * @param {HTMLElement} node Ссылка на элемент
 * @param {String|Array} name Имя атрибута | Список имен атрибутов
 * @public
 */
function removeAttributeFromNode (node, name)
  {
   if(node)
     {
      if(typeof(name)=="array")
        {
         for(var i=0, j=name.length; i<j; i++)
           {
            if(node.removeAttribute)
              node.removeAttribute(name[i])
            else
              {
               node[name[i]] = null;
               delete node[name[i]];
              }

           }
        }
      if(typeof(name)=="string")
        {
         if(node.removeAttribute)
           node.removeAttribute(name);
         else
           {
            node[name] = null;
            delete node[name];
           }
        }
     }
  }
/**
 * Метод задает или снимает имя класса у элемента
 * @param {HTMLElement} node Ссылка на элемент
 * @param {String} classname Имя класса
 * @param {Boolean} remove Флаг, того что умя класса нужно снять
 * @public
 */
function setClassNameForNode (node, classname, remove)
  {
   if(node && classname)
     {
      if(remove===true)
        {
         if(node.className)
           {
            var arr = node.className.split(' ');
            if(arr && arr.length)
              {
               for (var i = 0, j= arr.length; i <j; i++)
                 {
                  if(arr[i] == classname)
                    {
                     arr.splice(i, 1);
                     node.className = arr.join(' ');
                     return;
                    }
                 }
               node.className = node.className.split(classname).join('');
              }
            else
              {
               if(node.className == classname) node.className = '';
              }
           }
        }
      else
        {
         if(node.className)
           {
            if(node.className.indexOf(classname)==-1)
              node.className += ' ' + classname;
           }
         else node.className = classname;
        }
     }
  }
/**
 * Метод добавляет стиль для элемента
 * @param {HTMLElement} node Ссылка на элемент
 * @param {String} styleName Имя стиля
 * @param {String} styleValue Значение стиля
 * @public
 */
function setStyleForNode (node, styleName, styleValue)
  {
   if(node)
     {
      if(typeof(styleName)=='object')
        {
         for(var i in styleName)
           node.style[i] = styleName[i];
        }
      if(typeof(styleName)=='string')
        {
         node.style[styleName] = styleValue;
        }
     }
  }
/**
 * Метод добавляет элементу обработчики событий
 * @param {HTMLElement} node Ссылка на элемент
 * @param {String|Object} eventType Тип событий | Объект описывающий тип события - обработчик события
 * @param {Function} callback Обработчик события
 * @public
 */
function addEventListenerForNode(node,eventType,callback)
  {
   if(node)
     {
      if(typeof(eventType)=="object")
        {
         for(var i in eventType)
           {
            if(node.addEventListener)
              node.addEventListener(i,eventType[i],true);
            else
              node.attachEvent('on' + i, eventType[i]);
           }
        }
      if(typeof(eventType)=="string")
        {
         if(node.addEventListener)
           node.addEventListener(eventType,callback,true);
         else
           node.attachEvent('on' + eventType,callback);
        }
     }
  }
/**
 * Метод удаляет у элемента обработчики событий
 * @param {HTMLElement} node Ссылка на элемент
 * @param {String|Object} eventType Тип событий | Объект описывающий тип события - обработчик события
 * @param {Function} callback Обработчик события
 * @public
 */
function removeEventListenerForNode(node,eventType,callback)
  {
   if(node)
     {
      if(typeof(eventType)=="object")
        {
         for(var i in eventType)
           {
            if(node.removeEventListener)
              node.removeEventListener(i,eventType[i],true);
            else
              node.detachEvent('on' + i,eventType[i]);
           }

        }
      if(typeof(eventType)=="string")
        {
         if(node.removeEventListener)
           node.removeEventListener(eventType,callback,true);
         else
           node.detachEvent('on' + eventType,callback)
        }
     }
  }
/**
 * Метод добавляет один элемент в другой
 * @param {HTMLElement} parentNode Родительский элемент
 * @param {HTMLElement} node Дочерний элемент
 * @public
 */
function addNode(parentNode,node)
  {
   parentNode.appendChild(node);
  }
/**
 * Метод удаляет элемент из родительского
 * @param {HTMLElement} node Удаляемый элемент
 * @public
 */
function removeNode (node)
  {
   if(node)
     {
      node.parentNode.removeChild(node);
     }
  }
/**
 * Метод очищает элемент от дочерних узлов
 * @param {HTMLElement} node Очищаемый элемент
 * @private
 */
function clearNode (node)
  {
   while(node.firstChild)
     node.removeChild(node.firstChild);
  }
/**
 * Метод возвращает элемент с заданным идентификатором
 * @param {String} id Идентификатор элемента
 * @return {HTMLElement} Ссылка на элемент
 * @private
 */
function getElementById (id)
  {
   return document.getElementById(id);
  }
/**
 * Метод преобразует JSON-строку в объект Javascript
 * @param {String} str JSON-строка
 * @return {Object} Объект
 * @private
 */
function getJSONByString (str)
  {
   if (window.JSON && window.JSON.parse)
     {
      return(window.JSON.parse(str));
     }
   else
     {
      top.eval("top.jsnopdata = " + str);
      return(top.jsnopdata);
     }
  }
/**
 * Метод добавляет запись в журнал
 * @param {String} message Сообщение
 * @public
 */
function log (message)
  {
   if(top && top.console)
     top.console.log(message);
  }
/**
 * Метод преобразует время для Тимвокса
 * @param {Number} utc Время в UTC
 * @return {String} Строка в INT64
 * @private
 */
function timeToInt64 (utc)
  {
   utc = Math.ceil(utc/1000)+11644473600;
   return(utc + "0000000");
  }
})();