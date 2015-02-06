$(document).ready(function(){
	
	if(!$.browser.mobile)
	{
		$('body').addClass('desktop');
	}
	
	/****** MASTHEADS *******/	
	var mastheads = new SlideShow({
		pageInterval		: 3000
	});
	
	var paginationEl = $('.mastheads .pagination');
	
	$('.mastheads .masthead').each(function(index){
		
		mastheads.addPage(new TransitableObject({
			el				: $(this),
			animationTime	: 800
		}), index);
		
		var el = $('<li></li>');
		paginationEl.append(el);
		el.bind('click', {index : index}, function(evt){
			mastheads.changePage(evt.data.index);
		});
	});
	
	mastheads.bind('pageChanging', {}, function(evt, index){
		paginationEl.find('li').removeClass('active').eq(index).addClass('active');
	});
	
	mastheads.changePage(0);
	//mastheads.startTimer();
	
	
	/****** TABS *******/	
	var tabs = new PageManager();
	
	$('.benefits .tab_contents .tab_content').each(function(){
		tabs.addPage(new TabContent({
			el				: $(this),
			animationTime	: 1000
		}), $(this).attr('id'));
	});
	
	var elTabs = $('.benefits ul.tabs li').bind('click', function(){
		tabs.changePage($(this).attr('data-tab-content-id'));
	});
	
	tabs.bind('pageChanging', {}, function(evt, index){
		elTabs.removeClass('active').filter('[data-tab-content-id='+index+']').addClass('active');
	});
	
	tabs.changePage(elTabs.eq(0).attr('data-tab-content-id'));
	
});



/******************************** EVENT DISPATCHER *******************************/

var EventDispatcher = $.Class.create({
	
	_eventDispatcher: null,
	
	initialize: function(properties){
		this._eventDispatcher = $('<div></div>');
	},
	
	bind: function(event, data, fn){
		this._eventDispatcher.bind(event, data, fn);
	},
	
	unbind: function(event, fn){
		this._eventDispatcher.unbind(event, fn);
	},
	
	dispatchEvent: function(event, params){
		this._eventDispatcher.trigger(event, params);
	}
});


/******************************** TRANSITABLE OBJECT *******************************/

var TransitableObject = $.Class.create(EventDispatcher, {
	
	_el: null,
	_isShown: false,
	_animationTime: 300,
	
	initialize: function(properties){
		this.base('initialize', properties);
		this._el = properties.el;
		
		if(properties.animationTime) this._animationTime = properties.animationTime;
		
		this.forceHide();
	},
	
	show: function(){
		if(this._isShown) return;
		
		this._el.css('display', 'block');
		var self = this;
		this._isShown = true;
		this.transitIn();
		this.dispatchEvent('show');
	},
	
	transitIn: function(){
		var self = this;
		
		this._el.stop().fadeTo(this._animationTime, 1, function(){
			self.transitInComplete();
		});
	},
	
	transitInComplete:function(){
		this.dispatchEvent('transitInComplete');
	},
	
	hide: function(){
		if(!this._isShown) return;
		
		var self = this;
		this._isShown = false;
		this.transitOut();
		this.dispatchEvent('hide');
	},
	
	transitOut: function(){
		var self = this;
		this._el.stop().fadeTo(this._animationTime, 0, function(){
			self.transitOutComplete();
		});
	},
	
	forceHide: function(){
		this._el.stop().fadeTo(0,0);
		this._el.css('display', 'none');
		this._isShown = false;
	},
	
	transitOutComplete:function(){
		this.forceHide();
		this.dispatchEvent('transitOutComplete');
	}
});


/******************************** PAGE MANAGER *******************************/

var PageManager = $.Class.create(EventDispatcher, {
	_pages				: null,
	_currentPageIndex	: null,
	
	initialize: function(properties){
		this.base('initialize', properties);
		this._pages = [];
	},
	
	addPage: function(page, index){
		this._pages[index] = page;
	},
	
	changePage: function(index){
		if(index == this._currentPageIndex || !this._pages[index]) return;
		
		this.dispatchEvent('pageChanging', index);
		
		if(this._pages[this._currentPageIndex])
		{
			this.hideCurrentPage(index);
		}
		else this.showPage(index);
	},
	
	getCurrentPage: function(){
		return this._pages[this._currentPageIndex]
	},
	
	pageTransitOutComplete: function(evt){
		evt.data.self._currentPageIndex = null;
		evt.data.page.unbind('transitOutComplete', evt.data.self.pageTransitOutComplete);
		if(evt.data.nextPageIndex != undefined) evt.data.self.showPage(evt.data.nextPageIndex);
	},
	
	showPage: function(index)
	{
		if(!this._pages[index]) return;
		this._pages[index].show();
		this._currentPageIndex = index;
		this.dispatchEvent('pageChanged', this._currentPageIndex);
	},
	
	nextPage: function(){
		var index = parseInt(this._currentPageIndex) + 1;
		if(index > this._pages.length - 1) index = 0;
		this.changePage(index);
	},
	
	previousPage: function(){
		var index = this._currentPageIndex - 1;

		if(index < 0) index = this._pages.length - 1;
		this.changePage(index);
	},
	
	hideCurrentPage: function(nextPageIndex){
		
		for(var i in this._pages)
		{
			this._pages[i].unbind('transitOutComplete', this.pageTransitOutComplete);
		}
		
		this._pages[this._currentPageIndex].bind('transitOutComplete', {self:this, nextPageIndex:nextPageIndex, page:this._pages[this._currentPageIndex]}, this.pageTransitOutComplete);
		this._pages[this._currentPageIndex].hide();
	}
});

/******************************** TAB CONTENT *******************************/

var TabContent = $.Class.create(TransitableObject, { 

	initialize: function(properties){
		this.base('initialize', properties);
	},
	
	transitIn: function(){
		this._el.addClass('active');
		var self = this;
		
		//this
		/*
		var el = this._el;
		TweenMax.killTweensOf(el);
		TweenMax.fromTo(el, this._animationTime / 2000, {
			alpha		: 0
		}, {
			alpha		: 1,
			ease		: Expo.easeOut
		});
		*/
		
		//col left
		var el = this._el.find('.col_left');
		TweenMax.killTweensOf(el);
		TweenMax.fromTo(el, this._animationTime / 1000, {
			marginLeft	: -100,
			alpha		: 0
		}, {
			marginLeft	: 0,
			alpha		: 1,
			ease		: Expo.easeOut
		});
		
		//col right
		el = this._el.find('.col_right');
		TweenMax.killTweensOf(el);
		TweenMax.fromTo(el, this._animationTime / 1000, {
			marginRight	: 100,
			alpha		: 0
		}, {
			delay		: 0.1,
			marginRight	: 0,
			alpha		: 1,
			ease		: Expo.easeOut
		});
		
		//tables
		el = this._el.find('tr');
		var self = this;
		el.each(function(index){
			TweenMax.killTweensOf($(this));
			TweenMax.fromTo($(this), self._animationTime / 1000, {
				textIndent	: -50,
				alpha		: 0
			}, {
				delay		: index * 0.05,
				textIndent	: 0,
				alpha		: 1,
				ease		: Expo.easeOut
			});
		});
		
	},
	
	transitOut: function(){
		var self = this;
				
		this._el.removeClass('active');
		this.transitOutComplete();
		/*
		var el = this._el;
		
		
		
		TweenMax.killTweensOf(el);
		TweenMax.to(el, this._animationTime / 2000, {
			alpha		: 0,
			onComplete	: function(){
				self.transitOutComplete();
			}
		});
		*/
	},
	
	forceHide: function(){
		this._el.removeClass('active').css('display', 'none');
		this._isShown = false;
	}
});

/******************************** SLIDE SHOW *******************************/

var SlideShow = $.Class.create(PageManager, {
	
	_pageInterval: null,
	_timer: null,
	
	initialize: function(properties){
		this.base('initialize', properties);
		this._pageInterval = properties.pageInterval;
	},
	
	showPage: function(index){
		this.base('showPage', [index]);
		this.startTimer();
	},
	
	startTimer: function(){
		this.stopTimer();
		var self = this;
		this._timer = setTimeout(function(){
			self.nextPage();
		}, this._pageInterval);
	},
	
	stopTimer: function(){
		if(this._timer)
		{
			clearTimeout(this._timer);
			this._timer = null;
		}
	}
});
