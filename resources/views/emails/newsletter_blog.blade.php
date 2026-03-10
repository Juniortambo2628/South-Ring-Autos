<x-mail::message>
# South Ring Autos: New Article

Hello,

We have just published a new article that might interest you!

**{{ $post->title }}**

<x-mail::panel>
"{{ $post->excerpt }}"
</x-mail::panel>

<x-mail::button :url="config('app.url') . '/blog/' . $post->id">
Read Full Article
</x-mail::button>

Stay safe on the road!

Thanks,<br>
{{ config('app.name') }}

---
<p style="font-size: 10px; color: #6b7280; text-align: center;">You are receiving this because you subscribed to our newsletter.</p>
</x-mail::message>
