<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    public function store(Request $request)
{
    // Validate the request
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
    ]);

    \Log::debug('=== AFTER VALIDATION ===');
    \Log::debug('Validated data: ', $validated);

    try {
        $post = new Post();
        $post->title = $request->title;
        $post->content = $request->content;
        $post->user_id = auth()->id();
        $post->slug = Str::slug($request->title) . '-' . uniqid();
        
        // Handle image upload
        if ($request->hasFile('image')) {
            \Log::debug('Image file detected');
            $imagePath = $request->file('image')->store('posts', 'public');
            \Log::debug('Image stored at path: ' . $imagePath);
            $post->image = $imagePath;
            \Log::debug('Post image attribute set to: ' . $post->image);
        } else {
            \Log::debug('No image file in request');
        }
        
        \Log::debug('About to save post with data: ', $post->toArray());
        $post->save();
        \Log::debug('Post saved successfully with ID: ' . $post->id);
        
        // Refresh the model to see what's actually in the database
        $post->refresh();
        \Log::debug('After refresh, post image: ' . $post->image);

        // Load the user relationship
        $post->load('user');

        // Return response with full image URL
        return response()->json([
            'message' => 'Post created successfully',
            'post' => [
                'id' => $post->id,
                'user_id' => $post->user_id,
                'title' => $post->title,
                'content' => $post->content,
                'image' => $post->image ? Storage::url($post->image) : null,
                'slug' => $post->slug,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                'user' => $post->user,
                'comments' => [],
                'likes' => []
            ]
        ], 201);
        
    } catch (\Exception $e) {
        \Log::error('Error creating post: ' . $e->getMessage());
        \Log::error('Error trace: ' . $e->getTraceAsString());
        return response()->json([
            'message' => 'Error creating post',
            'error' => $e->getMessage()
        ], 500);
    }
}
}