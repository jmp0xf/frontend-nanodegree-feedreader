/* feedreader.js
 *
 * 这是 Jasmine 会读取的spec文件，它包含所有的要在你应用上面运行的测试。
 */

/* 我们把所有的测试都放在了 $() 函数里面。因为有些测试需要 DOM 元素。
 * 我们得保证在 DOM 准备好之前他们不会被运行。
 */
$(function() {
    /* 这是我们第一个测试用例 - 其中包含了一定数量的测试。这个用例的测试
     * 都是关于 Rss 源的定义的，也就是应用中的 allFeeds 变量。
    */
    describe('RSS Feeds', function() {
        // URL 正则表达式
        var regularExpressionUrl = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;

        /* 这是我们的第一个测试 - 它用来保证 allFeeds 变量被定义了而且
         * 不是空的。在你开始做这个项目剩下的工作之前最好实验一下这个测试
         * 比如你把 app.js 里面的 allFeeds 变量变成一个空的数组然后刷新
         * 页面看看会发生什么。
        */
        it('are defined', function() {
            expect(allFeeds).toBeDefined();
            expect(allFeeds.length).not.toBe(0);
        });

        function expectAllFeedsToSatisfy(predicate) {
            allFeeds.forEach(function (feed) {
                predicate(feed);
            });
        }

        function expectAllFeedsNotToBeEmpty(attr) {
            expectAllFeedsToSatisfy(function (feed) {
                expect(feed[attr]).toBeDefined();
                expect(feed[attr].length).toBeDefined();
                expect(feed[attr].length).not.toBe(0);
            });
        }

        /*
         * 编写一个测试遍历 allFeeds 对象里面的所有的源来保证有链接字段而且链接不是空的。
         */
        it('url is defined properly', function() {
            expectAllFeedsNotToBeEmpty("url");
            // 检查 URL 格式是否正确
            expectAllFeedsToSatisfy(function (feed) {
                expect(feed.url).toMatch(regularExpressionUrl);
            });
        });

        /*
         * 编写一个测试遍历 allFeeds 对象里面的所有的源来保证有名字字段而且不是空的。
         */
        it('name is defined', function() {
            expectAllFeedsNotToBeEmpty("name");
        });
    });


    /* 菜单功能的测试用例 */
    describe('Menu', function () {

        var body = $("body");
        var menu = $(".slide-menu");
        var menuToggle = $("a.menu-icon-link");

        /*
         * 写一个测试用例保证菜单元素默认是隐藏的。你需要分析 html 和 css
         * 来搞清楚我们是怎么实现隐藏/展示菜单元素的。
         */
        it('is hidden by default', function () {
            expect(body.hasClass("menu-hidden")).toBeTruthy();
            // 菜单向左位移必须大于菜单显示宽度才能保证隐藏
            expect(menu.offset().left + menu.outerWidth()).not.toBeGreaterThan(0);
        });

        /*
        * 写一个测试用例保证当菜单图标被点击的时候菜单会切换可见状态。这个
        * 测试应该包含两个 expectation ： 当点击图标的时候菜单是否显示，
        * 再次点击的时候是否隐藏。
        */
        describe('Menu Toggle', function() {
            beforeEach(function (done) {
                menu.bind("transitionend", function () {
                    done();
                });
                menuToggle.click();
            });

            afterEach(function () {
                menu.unbind("transitionend");
            });

            // 第一次点击显示菜单
            it('show menu by first click', function () {
                expect(body.hasClass("menu-hidden")).toBeFalsy();
                // 菜单回到原处则显示
                expect(menu.offset().left).toBe(0);
            });

            // 再次点击隐藏菜单
            it('hide menu by second click', function () {
                expect(body.hasClass("menu-hidden")).toBeTruthy();
                // 菜单向左位移必须大于菜单显示宽度才能保证隐藏
                expect(menu.offset().left + menu.outerWidth()).not.toBeGreaterThan(0);
            });
        });
    });

    /* 写一个叫做 "Initial Entries" 的测试用例 */
    describe('Initial Entries', function () {
        var container = $(".feed");
        var feeds = $(".feed-list a");
        var containerCopy = container.clone();

        beforeEach(function (done) {
            // 随机选择一个 id
            var randomIndex = Math.floor(Math.random() * feeds.length);
            loadFeed($(feeds[randomIndex]).data("id"), done);
        });

        // 还原 container
        afterAll(function () {
            container.html(containerCopy.html());
        });

        /*
         * 写一个测试保证 loadFeed 函数被调用而且工作正常，即在 .feed 容器元素
         * 里面至少有一个 .entry 的元素。
         *
         * 记住 loadFeed() 函数是异步的所以这个而是应该使用 Jasmine 的 beforeEach
         * 和异步的 done() 函数。
         */
        it('loadfeed add feed(s) to container', function () {
            expect(container.find(".entry").length).toBeGreaterThan(0);
        });
    });

    /* 写一个叫做 "New Feed Selection" 的测试用例 */
    describe('New Feed Selection', function () {
        var container = $(".feed");
        var feeds = $(".feed-list a");
        var containerCopy = container.clone();
        var lastContent;
        var lastFeedID = NaN;

        beforeEach(function (done) {
            // 随机选择一个跟上次选择不一样的 id
            var randomIndex, feedID;
            do {
                randomIndex = Math.floor(Math.random() * feeds.length);
                feedID = $(feeds[randomIndex]).data("id");
            } while (feedID==lastFeedID);
            lastFeedID = feedID;
            lastContent = container.html();
            loadFeed(feedID, done);
        });

        // 还原 container
        afterAll(function () {
            container.html(containerCopy.html());
        });

        /*
         * 写一个测试保证当用 loadFeed 函数加载一个新源的时候内容会真的改变。
         * 记住，loadFeed() 函数是异步的。
         */
        it('first loadfeed changes feeds content', function () {
            expect(container.html()).not.toBe(lastContent);
        });

        it('second loadfeed changes feeds content', function () {
            expect(container.html()).not.toBe(lastContent);
        });
    });
}());
