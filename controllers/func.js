// $(document).ready(function() {
//     $('#post-form').submit(function(event) {
//         // event.preventDefault();

//         let postTitle = $('#new-title').val();
//         let postBody = $('#new-body').val();

//         $.ajax({
//             type: 'POST',
//             url: '/homepage',
//             data: { post_title: postTitle, post_body: postBody },
//             success: function(response) {
//                 alert('New post published');
//                 clearForm();
//             },
//             error: function(error) {
//                 alert('New post not published: ' + error.responseText);
//             }
//         });
//     });

//     function clearForm() {
//         $('#post-form')[0].reset();
//     }
// });