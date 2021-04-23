$(document).ready(function() {
    $('.js-delete-article').on('click', function(e) {
        e.preventDefault();

        const $this = $(this),
              id = $this.attr('data-id');
        
        $.ajax({
            type: 'DELETE',
            url: `/articles/${id}`,
            success: function(res) {
                alert('Deleting Article');

                window.location.href = '/';
            },
            error: function(err) {
                console.log(err)
;            }
        });

        console.log($this);
    });
});