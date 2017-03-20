(function(){
    //localStorage和jsonp封装
    var save = (function(){
      var pre = "reader";
      var storageGetter = function(key){
          return localStorage.getItem(pre + key);
      };
      var storageSetter = function(key, val){
          return localStorage.setItem(pre + key,val);
      };
      var getJsonp = function(url,callback){
          return $.jsonp({
              url:url,
              cache:true,
              callback:'duokan_fiction_chapter',
              success:function(result){
                  var data = $.base64.decode(result);
                  var json = decodeURIComponent(escape(data));
                  callback(json);
              }
          })
      };
      return {
          storageGetter:storageGetter,
          storageSetter:storageSetter,
          getJsonp:getJsonp
      }
    })();
    var hnav = $('#head-nav');
    var bnav = $('#bottom-nav');
    var fpannel = $('#f-pannel');
    var ficcon = $('#fic-container');
    var titlecon = $('#title-container');
    var pcon = $('#paragraph-container');
    var body = $('body');
    var dayitem = $('#day-item');
    var nightitem = $('#night-item');
    var readerMes;
    var readerframe;
    var initFontSize = parseInt(save.storageGetter('font-size'));
    if(!initFontSize){initFontSize = 14;}
    pcon.css('font-size',initFontSize);
    body.css('background',save.storageGetter('background'));
    ficcon.css('color',save.storageGetter('color'));
    function main(){
        eventHanlder();
        readerMes = readerMessage();
        readerframe = readerRender(titlecon,pcon);
        readerMes.init(function(data){
            readerframe(data);
        });
    }
    main();
    //事件绑定函数
    function eventHanlder(){
        $('#action-block').click(function(){
            if(hnav.css('display') == 'none'){
                hnav.show();
                bnav.show();
            }
            else {
                hnav.hide();
                bnav.hide();
                fpannel.hide();
            }
        });
        $(window).scroll(function(){
                hnav.hide();
                bnav.hide();
                fpannel.hide();
        });
        $('#font-button').click(function(){
            fpannel.toggle();
        });
        //更改字体大小并且保存用户设置
        $('#large-font').click(function(){
            if(initFontSize > 20){
                return;
            }
            initFontSize += 1;
           pcon.css('font-size',initFontSize);
            save.storageSetter('font-size',initFontSize);
        });
        $('#small-font').click(function(){
            if(initFontSize < 10){
                return;
            }
            initFontSize -= 1;
            pcon.css('font-size',initFontSize);
            save.storageSetter('font-size',initFontSize);
        });
        //更改背景色并保存用户设置
        $('#btn1').click(function(){
           body.css('background','#e9dfc7') ;
            ficcon.children().css('color','#555');
            save.storageSetter('background','#e9dfc7');
            save.storageSetter('color','#555');
        });
        $('#btn2').click(function(){
            body.css('background','#fff') ;
            ficcon.children().css('color','#555');
            save.storageSetter('background','#fff');
            save.storageSetter('color','#555');
        });
        $('#btn3').click(function(){
            body.css('background','#b4fff3') ;
            ficcon.children().css('color','#555');
            save.storageSetter('background','#b4fff3');
            save.storageSetter('color','#555');
        });
        $('#btn4').click(function(){
            body.css('background','#d1b8f7') ;
            ficcon.children().css('color','#555');
            save.storageSetter('background','#d1b8f7');
            save.storageSetter('color','#555');
        });
        $('#btn5').click(function(){
            body.css('background', '#1a446e') ;
            ficcon.children().css('color','#b0e0e6');
            save.storageSetter('background','#1a446e');
            save.storageSetter('color','#b0e0e6');
        });
        //夜间模式切换
        $('#night-button').click(function(){
            if(dayitem.css('display') == 'none'){
                dayitem.show();
                nightitem.hide();
                body.css('background', '#1a446e') ;
                ficcon.children().css('color','#b0e0e6');
            }
            else {
                dayitem.hide();
                nightitem.show();
                body.css('background', '#e9dfc7') ;
                ficcon.children().css('color','#555');
            }

        });
        $('#pre-btn').click(function(){
            readerMes.preChapter(function(data){
                readerframe(data);
            });
        });
        $('#next-btn').click(function(){
            readerMes.nextChapter(function(data){
                readerframe(data);
            });
        });
    }
    //请求章节信息和内容
    function readerMessage(){
        var chapterId;
        var init = function(callback){
            getChapterInfo(function(){
                getChapterContent(chapterId,function(data){
                      callback && callback(data);
                })
            })
        };
        //初始页面请求
        var getChapterInfo = function(callback){
            $.get('data/chapter.json',function(data){
             chapterId = save.storageGetter('last-chapterId');
             if(chapterId == null){
                 chapterId = data.chapters[1].chapter_id;
             }
                callback && callback();
            },'json')
        };
        var getChapterContent = function (chapter_id,callback){
            $.get('data/data' + chapter_id + '.json', function(data) {
                if(data.result == 0){
                    var url = data.jsonp;
                    save.getJsonp(url,function(data){
                        callback && callback(data);
                    });
                }
            },'json');
        };
        //翻页请求
        var preChapter = function (callback) {
            if(chapterId == 1){
                return chapterId = 1;
            }
            chapterId -= 1;
            getChapterContent(chapterId,callback);
            save.storageSetter('last-chapterId',chapterId);
        };
        var nextChapter = function (callback) {
            if(chapterId == 4){
                return chapterId = 4;
            }
            chapterId += 1;
            getChapterContent(chapterId,callback);
            save.storageSetter('last-chapterId',chapterId);
        };
        return{
            init:init,
            preChapter:preChapter,
            nextChapter:nextChapter
        };
    }
    //页面渲染
    //改进为分别装入两个容器，解决翻页字体初始化的错误
    function readerRender(titlecon,pcon){
        function parseData(data){
            var jsonData = JSON.parse(data);
            var titleHtml = '<h2>' + jsonData.t + '</h2>';
            var pHtml = '';
            for(var i = 0;i<jsonData.p.length;i++){
                 pHtml += '<p>' + jsonData.p[i] + '</p>';
            }
           titlecon.html(titleHtml);
            pcon.html(pHtml);
        }
        return parseData;
        }
})();
