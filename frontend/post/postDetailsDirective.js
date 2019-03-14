(function() {
    'use strict';

    var app = angular.module('app');

    app.controller('PostDetailsController', function(PostService, AuthService, CommentService, $state,
        $mdDialog, MessageService, ngClipboard, ProfileService, $rootScope, 
        POST_EVENTS, STATES, EventService, SCREEN_SIZES) {

        var postDetailsCtrl = this;

        var LIMIT_POST_CHARACTERS = 1000;
        const REMOVE_POST_BY_INST_PERMISSION = 'remove_posts';
        const REMOVE_POST_BY_POST_PERMISSION = 'remove_post';
        const EDIT_POST_PERMISSION = 'edit_post';

        postDetailsCtrl.showComments = false;
        postDetailsCtrl.savingComment = false;
        postDetailsCtrl.savingLike = false;
        postDetailsCtrl.isLoadingComments = true;

        var URL_POST = '/posts/';
        postDetailsCtrl.user = AuthService.getCurrentUser();
        
        postDetailsCtrl.deletePost = function deletePost(ev) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Excluir Post')
                .textContent('Este post será excluído e desaparecerá para os usuários que seguem a instituição.')
                .ariaLabel('Deletar postagem')
                .targetEvent(ev)
                .ok('Excluir')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function() {
                postDetailsCtrl.post = new Post(postDetailsCtrl.post);
                PostService.deletePost(postDetailsCtrl.post).then(function success() {
                    postDetailsCtrl.post.remove(postDetailsCtrl.user.name);
                    if(postDetailsCtrl.removePost)
                        $rootScope.$emit(
                            POST_EVENTS.DELETED_POST_EVENT_TO_UP, 
                            postDetailsCtrl.post
                        );
                    MessageService.showToast('Post excluído com sucesso');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        postDetailsCtrl.isAuthorized = function isAuthorized() {
            return postDetailsCtrl.isPostAuthor() || isInstitutionAdmin();
        };

        postDetailsCtrl.isDeleted = function isDeleted(object=postDetailsCtrl.post) {
            return object.state == 'deleted';
        };

        postDetailsCtrl.isDeletedEvent = function isDeletedEvent(post) {
            if(post.shared_event){
                return postDetailsCtrl.isDeleted(post.shared_event);
            }
        };

        postDetailsCtrl.isHidden = function isHidden() {
            var isDeleted = postDetailsCtrl.post.state === "deleted";
            return isDeleted && !postDetailsCtrl.postHasActivity();
        };

        postDetailsCtrl.isShowTitle = function isShowTitle(post) {
            return !postDetailsCtrl.isDeleted(post) && 
                    postDetailsCtrl.showPost();
        };

        postDetailsCtrl.isShared = function isShared() {
            return postDetailsCtrl.post.shared_post ||
                postDetailsCtrl.post.shared_event;
        };

        postDetailsCtrl.isSharedSurvey = function isSharedSurvey() {
            return postDetailsCtrl.post.shared_post && 
                postDetailsCtrl.post.shared_post.type_survey;
        };

        postDetailsCtrl.timeHasBeenExpired = function timeHasBeenExpired(post) {
            if(post && post.type_survey) {
                var deadline = new Date (post.deadline);
                var currentTime = new Date((_.split(new Date().toISOString(), '.')[0]));
                return deadline < currentTime;
            }
            return false;
        };

        function getSurveyCSSClass() {
            return postDetailsCtrl.timeHasBeenExpired(postDetailsCtrl.post) ? 'grey-background' : '';
        }

        postDetailsCtrl.getCSSClassPost = function getCSSClassPost() {
            return (postDetailsCtrl.isDeleted(postDetailsCtrl.post) || 
                    postDetailsCtrl.isDeletedEvent(postDetailsCtrl.post) || 
                        postDetailsCtrl.isInstInactive()) ? 'post-deleted': getSurveyCSSClass();
        };

        postDetailsCtrl.postHasActivity = function postHasActivity() {
            var hasNoComments = postDetailsCtrl.post.number_of_comments === 0;
            var hasNoLikes = postDetailsCtrl.post.number_of_likes === 0;

            return !hasNoComments || !hasNoLikes;
        };

        postDetailsCtrl.isSharedSurveyExpired = function isSharedSurveyExpired() {
            return postDetailsCtrl.post.shared_post.type_survey &&
                postDetailsCtrl.timeHasBeenExpired(postDetailsCtrl.post.shared_post);
        };

        postDetailsCtrl.showSharedPost = function showSharedPost() {
            return postDetailsCtrl.post.shared_post &&
                !postDetailsCtrl.isDeleted(postDetailsCtrl.post);
        };

        postDetailsCtrl.showSharedPostText = function showSharedPostText() {
            return !postDetailsCtrl.isDeleted(postDetailsCtrl.post.shared_post) &&
                !postDetailsCtrl.post.shared_post.type_survey;
        };

        postDetailsCtrl.showSharedEvent = function showSharedEvent() {
            return postDetailsCtrl.post.shared_event &&
                !postDetailsCtrl.isDeleted(postDetailsCtrl.post);
        };

        postDetailsCtrl.showSurvey = function showSurvey() {
            return postDetailsCtrl.post.type_survey;
        };

        /**
         * Show the comment input field if the post comments or the 
         * post page are being showed, besides that the post must not
         * be deleted, be of the type SURVEY or have its institution
         * on the inactive state
         */
        postDetailsCtrl.showCommentInput = function showCommentInput() {
            return (postDetailsCtrl.showComments || postDetailsCtrl.isPostPage) && 
                !postDetailsCtrl.isDeleted(postDetailsCtrl.post) &&
                !postDetailsCtrl.isInstInactive() && 
                !postDetailsCtrl.showSurvey();
        };

        postDetailsCtrl.showPost = function showPost() {
            return !postDetailsCtrl.showSurvey() && !postDetailsCtrl.isShared();
        };
        
        postDetailsCtrl.showTextPost = function showTextPost(){
            return !postDetailsCtrl.isDeleted(postDetailsCtrl.post) &&
                     postDetailsCtrl.showPost();
        };

        /**
         * Show the delete button if the user has the necessary permissions
         * and if the post is not deleted or its institution on state inactive.
         */
        postDetailsCtrl.showButtonDelete = function showButtonDelete() {
            const hasInstitutionPermission = postDetailsCtrl.user.hasPermission(REMOVE_POST_BY_INST_PERMISSION, postDetailsCtrl.post.institution_key);
            const hasPostPermission = postDetailsCtrl.user.hasPermission(REMOVE_POST_BY_POST_PERMISSION, postDetailsCtrl.post.key);
            const hasPermission = hasInstitutionPermission || hasPostPermission;
            return hasPermission && !postDetailsCtrl.isDeleted(postDetailsCtrl.post) && !postDetailsCtrl.isInstInactive();
        };

        postDetailsCtrl.showActivityButtons = function showActivityButtons() {
            return !postDetailsCtrl.showSurvey() && !postDetailsCtrl.isSharedSurvey();
        }

        postDetailsCtrl.disableButton = function disableButton() {
            return postDetailsCtrl.savingLike ||
                postDetailsCtrl.isDeleted(postDetailsCtrl.post) || postDetailsCtrl.isInstInactive();
        };

        postDetailsCtrl.canShare = function(){
            return !postDetailsCtrl.isDeleted(postDetailsCtrl.post) &&
                 !postDetailsCtrl.isInstInactive();
        };

        postDetailsCtrl.showButtonEdit = function showButtonEdit() {
            const hasPermission = postDetailsCtrl.user.hasPermission(EDIT_POST_PERMISSION, postDetailsCtrl.post.key);
            var isActiveInst = postDetailsCtrl.post.institution_state == "active";
            return hasPermission && !postDetailsCtrl.isDeleted(postDetailsCtrl.post) && isActiveInst &&
                    !postDetailsCtrl.postHasActivity() && !postDetailsCtrl.isShared() && !postDetailsCtrl.showSurvey();
        };

        postDetailsCtrl.copyLink = function copyLink(){
            var url = Utils.generateLink(URL_POST + postDetailsCtrl.post.key);
            ngClipboard.toClipboard(url);
            MessageService.showToast("O link foi copiado");
        };

        postDetailsCtrl.likeOrDislikePost = function likeOrDislikePost() {
            var promise;
            if(!postDetailsCtrl.isLikedByUser()) {
                promise = likePost();
            } else {
                promise = dislikePost();
            }
            return promise;
        };

        postDetailsCtrl.editPost = function editPost(event) {
            $mdDialog.show({
                controller: function DialogController() {},
                controllerAs: "controller",
                templateUrl: 'app/home/post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: {
                    originalPost: postDetailsCtrl.post,
                    isEditing: true
                },
                bindToController: true
            }).then(function success(editedPost) {
                postDetailsCtrl.post.title = editedPost.title;
                postDetailsCtrl.post.text = editedPost.text;
                postDetailsCtrl.post.photo_url = editedPost.photo_url;
                postDetailsCtrl.post.pdf_files = editedPost.pdf_files;
                postDetailsCtrl.post.video_url = editedPost.video_url;
            }, function error() {});
        };

        postDetailsCtrl.share = function share(post, event) {
            post = getOriginalPost(postDetailsCtrl.post);
            $mdDialog.show({
                controller: "SharePostController",
                controllerAs: "sharePostCtrl",
                templateUrl: Utils.selectFieldBasedOnScreenSize(
                    'app/post/share_post_dialog.html',
                    'app/post/share_post_dialog_mobile.html'
                ),
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: {
                    user : postDetailsCtrl.user,
                    post: post,
                    addPost: true
                }
            });
        };

        postDetailsCtrl.addSubscriber = function addSubscriber() {
            PostService.addSubscriber(postDetailsCtrl.post.key).then(function success() {
                MessageService.showToast('Esse post foi marcado como de seu interesse.');
                postDetailsCtrl.post.subscribers.push(postDetailsCtrl.user.key);
            });
        };

        postDetailsCtrl.removeSubscriber = function removeSubscriber() {
            PostService.removeSubscriber(postDetailsCtrl.post.key).then(function success() {
                MessageService.showToast('Esse post foi removido dos posts de seu interesse.');
                _.remove(postDetailsCtrl.post.subscribers, function(userKey) {
                    return userKey === postDetailsCtrl.user.key;
                });
            }, function error(response) {
                $state.go($state.current);
            });
        };

        postDetailsCtrl.isSubscriber = function isSubscriber() {
            return _.includes(postDetailsCtrl.post.subscribers, postDetailsCtrl.user.key);
        };

        postDetailsCtrl.addOrRemoveSubscriber = function addOrRemoveSubscriber() {
            if (!postDetailsCtrl.isSubscriber()) {
                postDetailsCtrl.addSubscriber();
            } else {
                postDetailsCtrl.removeSubscriber();
            }
        };

        postDetailsCtrl.getResponsiveTitleClass = function getResponsiveTitleClass() {
            return Utils.isLargerThanTheScreen(postDetailsCtrl.post.title) ? 'break' : 'no-break';
        };

        /**
         * Checks if the post is actually an event that has been shared.
         */
        postDetailsCtrl.isSharedEvent = () => {
            return postDetailsCtrl.post.shared_event; 
        };

        /**
         * Checks if the user is following the event, if so
         * the user will receive notifications related to the event.
         */
        postDetailsCtrl.isFollowingEvent = () => {
            const eventFollowers = (postDetailsCtrl.post.shared_event && postDetailsCtrl.post.shared_event.followers) || [];
            return eventFollowers.includes(postDetailsCtrl.user.key);
        };

        /**
         * Add the user as an event's follower.
         * Thus, the user will receive notifications related to the event.
         */
        postDetailsCtrl.followEvent = () => {
            EventService.addFollower(postDetailsCtrl.post.shared_event.key).then(() => {
                postDetailsCtrl.post.shared_event.addFollower(postDetailsCtrl.user.key);
                MessageService.showToast('Você receberá as atualizações desse evento.');
            });
        };

        /**
         * Remove the user from the event's followers list.
         * Thus, the user won't receive any notification related to the event.
         */
        postDetailsCtrl.unFollowEvent = () => {
            EventService.removeFollower(postDetailsCtrl.post.shared_event.key).then(() => {
                postDetailsCtrl.post.shared_event.removeFollower(postDetailsCtrl.user.key);
                MessageService.showToast('Você não receberá as atualizações desse evento.');
            });
        };

        function getOriginalPost(post){
            if(post.shared_post){
                return post.shared_post;
            } else if(post.shared_event){
                return post.shared_event;
            }
            return post;
        }

        function likePost() {
            postDetailsCtrl.savingLike = true;
            var promise = PostService.likePost(postDetailsCtrl.post);
            promise.then(function success() {
                addPostKeyToUser(postDetailsCtrl.post.key);
                postDetailsCtrl.post.number_of_likes += 1;
                postDetailsCtrl.savingLike = false;
                postDetailsCtrl.getLikes(postDetailsCtrl.post);
            }, function error(response) {
                $state.go(STATES.HOME);
                postDetailsCtrl.savingLike = false;
            });
            return promise;
        }

        function dislikePost() {
            postDetailsCtrl.savingLike = true;
            var promise = PostService.dislikePost(postDetailsCtrl.post);
            promise.then(function success() {
                removePostKeyFromUser(postDetailsCtrl.post.key);
                postDetailsCtrl.post.number_of_likes -= 1;
                postDetailsCtrl.savingLike = false;
                postDetailsCtrl.getLikes(postDetailsCtrl.post);
            }, function error(response) {
                $state.go(STATES.HOME);
                postDetailsCtrl.savingLike = false;
            });
            return promise;
        }

        postDetailsCtrl.isLikedByUser = function isLikedByUser() {
            var likedPostsKeys = _.map(postDetailsCtrl.user.liked_posts, getKeyFromUrl);
            return _.includes(likedPostsKeys, postDetailsCtrl.post.key);
        };

        function addPostKeyToUser(key) {
            postDetailsCtrl.user.liked_posts.push(key);
            AuthService.save();
        }

        function removePostKeyFromUser(key) {
            _.remove(postDetailsCtrl.user.liked_posts, foundPost => getKeyFromUrl(foundPost) === key);
            AuthService.save();
        }

        function getKeyFromUrl(url) {
            var key = url;
            if(url.indexOf("/api/key/") != -1) {
                var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
            return key;
        }

        postDetailsCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go(STATES.INST_TIMELINE, {institutionKey: institutionKey});
        };

        postDetailsCtrl.goToPost = function goToPost(post) {
            $state.go(STATES.POST, {key: post.key});
        };

        postDetailsCtrl.goToPostComment = function goToPostComment(post) {
            $state.go(STATES.POST, {key: post.key, focus:true});
        };

        postDetailsCtrl.goToEvent = function goToEvent(event) {
            $state.go(STATES.EVENT_DETAILS, {eventKey: event.key});
        };

        postDetailsCtrl.reloadPost = function reloadPost() {
            var type_survey = postDetailsCtrl.post.type_survey;
            postDetailsCtrl.post.type_survey = '';
            var promise = PostService.getPost(postDetailsCtrl.post.key);
            promise.then(function success(response) {
                response.data_comments = Object.values(response.data_comments);
                postDetailsCtrl.post = response;
                postDetailsCtrl.isLoadingComments = false;
            }, function error(response) {
                postDetailsCtrl.post.type_survey = type_survey;
                postDetailsCtrl.isLoadingComments = true;
            }); 
            return promise;
        }

        postDetailsCtrl.loadComments = function refreshComments() {
            var promise  =  CommentService.getComments(postDetailsCtrl.post.comments);
            promise.then(function success(response) {
                postDetailsCtrl.post.data_comments = _.values(response);
                postDetailsCtrl.post.number_of_comments = _.size(postDetailsCtrl.post.data_comments);
                postDetailsCtrl.isLoadingComments = false;
            }, function error(response) {
                postDetailsCtrl.isLoadingComments = true;
            });
            return promise;
        };

        /**
         * Function to show post comments or redirect to post page.
         * If the screen width less than 600 pixels (mobile devices), redirect to post page
         * otherwise show all post comments.
         */
        postDetailsCtrl.showCommentsOrRedirectToPostPage = function showCommentsOrRedirect() {
            if (window.screen.width > 600)
                return postDetailsCtrl.getComments();
            else
                postDetailsCtrl.goToPostComment(postDetailsCtrl.post); 
        };

        postDetailsCtrl.getComments = function getComments() {
            postDetailsCtrl.showComments = !postDetailsCtrl.showComments;
            if (postDetailsCtrl.showComments){
                return postDetailsCtrl.loadComments();
            } else {
                postDetailsCtrl.post.data_comments = [];
            }
        };

        postDetailsCtrl.getLikes = function getLikes() {
            var likesUri = postDetailsCtrl.post.likes;
            if(postDetailsCtrl.isPostPage) {
                var promise = PostService.getLikes(likesUri);
                promise.then(function success(response) {
                    postDetailsCtrl.post.data_likes = response;
                    postDetailsCtrl.post.number_of_likes = _.size(postDetailsCtrl.post.data_likes);
                });
                return promise;
            }else{
                postDetailsCtrl.post.data_likes = [];
            }
        };

        function addComment(post, comment) {
            var postComments = postDetailsCtrl.post.data_comments;
            postComments.push(comment);
            post.number_of_comments += 1;
        }

        postDetailsCtrl.createComment = function createComment() {
            var newComment = postDetailsCtrl.newComment;
            var institutionKey = postDetailsCtrl.user.current_institution.key;
            var promise;
            if (!_.isEmpty(newComment)) {
                postDetailsCtrl.savingComment = true;
                promise = CommentService.createComment(postDetailsCtrl.post.key, newComment, institutionKey);
                promise.then(function success(response) {
                    postDetailsCtrl.newComment = '';
                    addComment(postDetailsCtrl.post, response);
                    postDetailsCtrl.savingComment = false;
                }, function error(response) {
                    $state.go(STATES.HOME);
                });
            } else {
                MessageService.showToast("Comentário não pode ser vazio.");
            }
            return promise;
        };

        postDetailsCtrl.isPostAuthor = function isPostAuthor() {
            return postDetailsCtrl.post.author_key === postDetailsCtrl.user.key;
        };

        postDetailsCtrl.isPostEmpty = function  isPostEmpty() {
            return !postDetailsCtrl.post || _.isEmpty(postDetailsCtrl.post);
        };


        function isInstitutionAdmin() {
            return _.includes(_.map(postDetailsCtrl.user.institutions_admin, getKeyFromUrl), postDetailsCtrl.post.institution_key);
        }

        /**
        * replace urls in a string with links to make the urls clickable.
        * If urls don't containing http or https, this function add the https.
        * @param {object} receivedPost - The post to be recognized.
        * @return {object} The post with clickable urls.
        * OBS: This function returns a new Post because this result is only for show in view.
        * It is not necessary to change the original Post.
        */
        postDetailsCtrl.postToURL =  function postToURL(receivedPost) {
            var post = new Post(receivedPost, receivedPost.institutionKey);
            if(post.text){
                post.text = Utils.recognizeUrl(post.text);
                post.text = adjustText(post.text);
            }
            return post;
        };

        postDetailsCtrl.showImage = function showImage(post) {
            var postObj = new Post(post);
            return postObj.hasImage() && !postObj.isDeleted();
        };

        postDetailsCtrl.showVideo = function showVideo(post) {
            var postObj = new Post(post);
            return postObj.hasVideo() && !postObj.isDeleted();
        };

        postDetailsCtrl.getVideoUrl = function getVideoUrl(post) {
            var postObj = new Post(post);
            return postObj.getVideoUrl();
        };

        postDetailsCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        postDetailsCtrl.isInstInactive = function isInstInactive() {
            return postDetailsCtrl.post.institution_state === 'inactive';
        };

        postDetailsCtrl.number_of_likes = function number_of_likes() {
            return postDetailsCtrl.post.number_of_likes < 100 ?
            postDetailsCtrl.post.number_of_likes : "+99";
        };

        postDetailsCtrl.number_of_comments = function number_of_comments() {
            return postDetailsCtrl.post.number_of_comments < 100 ?
            postDetailsCtrl.post.number_of_comments : "+99";
        };

        postDetailsCtrl.getButtonColor = function getButtonColor(condition=true, isCommentButton) {
            var hasComments = (postDetailsCtrl.post.number_of_comments > 0 && isCommentButton);
            var isNotDeletedOrHasComments = !postDetailsCtrl.isDeleted() || hasComments;
            var color = condition && isNotDeletedOrHasComments ? 'light-green' : 'grey';
            return {background: color};
        };

        /**
         * Checks if the application is being used by a mobile device.
         */
        postDetailsCtrl.isMobileScreen = () => {
            return Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
        };

        function adjustText(text){
            return (!postDetailsCtrl.isPostPage && text) ?
                Utils.limitString(text, LIMIT_POST_CHARACTERS) : text;
        }

        postDetailsCtrl.$onInit = () => {
            if (postDetailsCtrl.isSharedEvent()) {
                postDetailsCtrl.post.shared_event = new Event(postDetailsCtrl.post.shared_event);
            }
        };

        postDetailsCtrl.$postLink = function() {
            if($state.params.focus){
                window.location.href= window.location.href + '#comment-input';
            }
        };
    });

    app.directive("postDetails", function() {
        return {
            restrict: 'E',
            templateUrl: "app/post/post_details.html",
            controllerAs: "postDetailsCtrl",
            controller: "PostDetailsController",
            scope: {},
            bindToController: {
                post: '=',
                isPostPage: '=',
                removePost: '='
            }
        };
    });
})();