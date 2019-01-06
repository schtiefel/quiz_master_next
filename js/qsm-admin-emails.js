/**
 * QSM - Admin emails
 */

var QSMAdminEmails;
(function ($) {
	QSMAdminEmails = {
		saveEmails: function() {
			var emails = [];
			var email = {};
			$( '.email' ).each( function() {
				email = {
					'conditions': [],
					'to': $( this ).find( '.to-email' ).val(),
					'subject': $( this ).find( '.subject' ).val(),
					'content': $( this ).find( '.email-template' ).val(),
					'replyTo': $( this ).find( '.reply-to' ).prop( 'checked' ),
				};
				$( this ).find( '.email-condition' ).each( function() {
					email.conditions.push({
						'criteria': $( this ).children( '.email-condition-criteria' ).val(),
						'operator': $( this ).children( '.email-condition-operator' ).val(),
						'value': $( this ).children( '.email-condition-value' ).val()
					});
				});
				emails.push( email );
			});
			var data = {
				'emails': emails
			}
			$.ajax({
				url: wpApiSettings.root + 'quiz-survey-master/v1/quizzes/' + qsmEmailsObject.quizID + '/results',
				method: 'POST',
				data: data,
				headers: { 'X-WP-Nonce': qsmEmailsObject.nonce },
			})
				.done(function( results ) {
					if ( results.status ) {
						alert( 'Saved!' );
					} else {
						alert( 'Not Saved!' );
					}
				});
		},
		loadEmails: function() {
			$.ajax({
				url: wpApiSettings.root + 'quiz-survey-master/v1/quizzes/' + qsmEmailsObject.quizID + '/results',
				headers: { 'X-WP-Nonce': qsmEmailsObject.nonce },
			})
				.done(function( emails ) {
					emails.forEach( function( email, i, emails ) {
						QSMAdminEmails.addEmail( email.conditions, email.to, email.subject, email.content, email.replyTo );
					});
				});
		},
		addCondition: function( $email, criteria, operator, value ) {
			var template = wp.template( 'email-condition' );
			$email.find( '.email-when-conditions' ).append( template({
				'criteria': criteria,
				'operator': operator,
				'value': value
			}));
		},
		newCondition: function( $email ) {
			QSMAdminEmails.addCondition( $email, 'score', 'equal', 0 );
		},
		addEmail: function( conditions, to, subject, content, replyTo ) {
			var template = wp.template( 'email' );
			$( '#emails' ).append( template( { to: to, subject: subject, content: content, replyTo: replyTo } ) );
			conditions.forEach( function( condition, i, conditions) {
				QSMAdminEmails.addCondition( 
					$( '.email:last-child' ), 
					condition.criteria,
					condition.operator,
					condition.value
				);
			});
		},
		newEmail: function() {
			var conditions = [{
				'criteria': 'score',
				'operator': 'greater',
				'value': '0'
			}];
			var to = '%USER_EMAIL%';
			var subject = 'Quiz Results For %QUIZ_NAME%';
			var content = '%QUESTIONS_ANSWERS%';
			var replyTo = false;
			QSMAdminEmails.addEmail( conditions, to, subject, content, replyTo );
		}
	};
	$(function() {
		QSMAdminEmails.loadEmails();

		$( '.add-new-page' ).on( 'click', function( event ) {
			event.preventDefault();
			QSMAdminEmails.newEmail();
		});
		$( '.save-pages' ).on( 'click', function( event ) {
			event.preventDefault();
			QSMAdminEmails.saveEmails();
		});
		$( '#emails' ).on( 'click', '.new-condition', function( event ) {
			event.preventDefault();
			$page = $( this ).closest( '.email' );
			QSMAdminEmails.newCondition( $page );
		});
		$( '#emails' ).on( 'click', '.delete-page-button', function( event ) {
			event.preventDefault();
			$( this ).closest( '.email' ).remove();
		});
		$( '#emails' ).on( 'click', '.delete-condition-button', function( event ) {
			event.preventDefault();
			$( this ).closest( '.email-condition' ).remove();
		});
	});
}(jQuery));