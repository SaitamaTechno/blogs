<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Mail\VerificationEmail;
use App\Models\Post;
use Illuminate\Support\Str;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Storage;

Route::post('/register', function(Request $request) {
    try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verification_token' => \Str::random(60),
            'email_verified_at' => null,
        ]);

        // Send verification email
        Mail::to($user->email)->send(new VerificationEmail($user));

        return response()->json([
            'message' => 'User registered successfully. Please check your email for verification.',
            'user' => $user
        ], 201);

    } catch (ValidationException $e) {
        return response()->json([
            'errors' => $e->errors()
        ], 422);
    }
});

// Add these new routes
Route::get('/email/verify/{token}', function($token) {
    $user = User::where('email_verification_token', $token)->first();

    if (!$user) {
        return response()->json(['message' => 'Invalid verification token'], 404);
    }

    $user->email_verified_at = now();
    $user->email_verification_token = null;
    $user->role='blogger';
    $user->save();

    return response()->json(['message' => 'Email verified successfully']);
});

Route::post('/email/resend', function(Request $request) {
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if ($user->email_verified_at) {
        return response()->json(['message' => 'Email already verified'], 400);
    }

    // Regenerate token if needed
    if (!$user->email_verification_token) {
        $user->email_verification_token = \Str::random(60);
        $user->save();
    }

    // Resend verification email
    Mail::to($user->email)->send(new VerificationEmail($user));

    return response()->json(['message' => 'Verification email resent']);
});

Route::post('/login', function(Request $request) {
    $executed = RateLimiter::attempt(
        'login:'.$request->ip(),
        $perMinute = 5,
        function() {}
    );
    
    if (!$executed) {
        return response()->json(['message' => 'Too many login attempts. Please try again later.'], 429);
    }

    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'message' => 'The provided credentials are incorrect.'
        ], 401);
    }

    // Check if email is verified
    if (!$user->email_verified_at) {
        return response()->json([
            'message' => 'Please verify your email address first.',
            'needs_verification' => true,
            'email' => $user->email
        ], 403);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user
    ]);
});

Route::middleware('auth:sanctum')->group(function() {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', function(Request $request) {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    });
});

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});


/////////////////////////////////////////////////////////////


Route::get('/posts12', function(Request $request) {

    if ($request->has('filter') && $request->filter) {
        if ($request->filter=='time'){
            $query = Post::with(['user', 'comments.user','likes'])->latest();
        } else if ($request->filter=='likes'){
            $query = Post::with(['user', 'comments.user','likes'])
                                ->withCount('likes')
                                ->orderBy('likes_count','desc');
        } else if ($request->filter=='comments'){
            $query = Post::with(['user', 'comments.user','likes'])
                                ->withCount('comments')
                                ->orderBy('comments_count','desc');        
        }
    }

    return response()->json([
        'posts' => $query->latest()->paginate(12)

    ]);
});

Route::get('/postself', function(Request $request) {
    
    if ($request->has('filter') && $request->filter) {
        if ($request->filter=='time'){
            $query = Post::with(['user', 'comments.user','likes'])->latest();
        } else if ($request->filter=='likes'){
            $query = Post::with(['user', 'comments.user','likes'])->latest("likes");
        } else if ($request->filter=='comments'){
            $query = Post::with(['user', 'comments.user','likes'])
                                ->withCount('comments')
                                ->orderBy('comments_count','desc');        
        }
    }

    // Add user filter if user_id parameter is provided
    if ($request->has('user_id') && $request->user_id) {
        $query->where('user_id', $request->user_id);
    }
    return response()->json([
        'posts' => $query->latest()->paginate(12)
    ]);
});

Route::get('/posts/{slug}', function($slug) {
    $post = Post::with(['user', 'comments.user','likes'])->where('slug', $slug)->first();
    
    if (!$post) {
        return response()->json(['message' => 'Post not found'], 404);
    }
    
    return response()->json(['post' => $post]);
});

Route::middleware('auth:sanctum')->group(function() {

    Route::get('/profile', function(Request $request) {
    $query = Post::with(['user']);

    // Add user filter if user_id parameter is provided
    if ($request->has('user_id') && $request->user_id) {
        $query->where('user_id', $request->user_id);
    }
    return response()->json([
        'user' => $query->where('user_id', $request->user_id)->first()
    ]);
    });


    // Like routes
    Route::post('/posts/{id}/like', function(Request $request, $id) {
        Log::debug('Debugging likes', ['post likes' => $request->user()->id]);

        $post = Post::find($id);
        
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }
        
        // Check if user already liked this post
        $existingLike = $post->likes()->where('user_id', $request->user()->id)->first();
        
        if ($existingLike) {
            return response()->json(['message' => 'You already liked this post'], 400);
        }
        
        // Create like
        $like = $post->likes()->create([
            'user_id' => $request->user()->id
        ]);
        
        // Increment likes count
        $post->increment('likes');
        
        return response()->json([
            'message' => 'Post liked successfully',
            'likes_count' => $post->likes
        ]);
    });
    
    // Unlike route
    Route::delete('/posts/{id}/like', function(Request $request, $id) {
        $post = Post::find($id);
        
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }
        
        // Find and delete the like
        $like = $post->likes()->where('user_id', $request->user()->id)->first();
        
        if (!$like) {
            return response()->json(['message' => 'You haven\'t liked this post'], 400);
        }
        
        $like->delete();
        
        // Decrement likes count
        $post->decrement('likes');
        
        return response()->json([
            'message' => 'Post unliked successfully',
            'likes_count' => $post->likes
        ]);
    });
    });
    Route::middleware('auth:sanctum')->group(function() {
    
    // Posts
    Route::post('/posts', function(Request $request) {
        if ($request->user()->is_banned) {
            return response()->json(['message' => 'You are banned from posting'], 403);
        }
        
        if (!$request->user()->isAdmin() && !$request->user()->isBlogger()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);
        $files = $request->allFiles();
        Log::debug('Files count: ' . count($files));
        
        foreach ($files as $key => $file) {
            Log::debug("File {$key}: " . $file->getClientOriginalName());
        }
        
        if ($request->hasFile('image')) {
            Log::debug('Image file found in request');
            try {
                $path = $request->file('image')->store('images', 'public');
                Log::debug('File stored at: ' . $path);
                $post = $request->user()->posts()->create([
                    'title' => $validated['title'],
                    'content' => $validated['content'],
                    'image' => $path,
                    'slug' => \Str::slug($validated['title']) . '-' . \Str::random(6),
                ]);
                
                return response()->json(['post' => $post], 201);
            } catch (\Exception $e) {
                Log::error('Error storing file: ' . $e->getMessage());
                return response()->json([
                    'success' => false, 
                    'error' => $e->getMessage()
                ], 500);
            }
        }
        else{
            $post = $request->user()->posts()->create([
                    'title' => $validated['title'],
                    'content' => $validated['content'],
                    'slug' => \Str::slug($validated['title']) . '-' . \Str::random(6),
                ]);
                
                return response()->json(['post' => $post], 201);
        }
        
    });
    
    Route::delete('/posts/{id}', function(Request $request, $id) {
        $post = Post::find($id);
        
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }
        
        if (!$request->user()->isAdmin() && $request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $post->delete();
        if ($post->image && Storage::disk('public')->exists($post->image)) {
            Storage::disk('public')->delete($post->image);
        }
        
        return response()->json(['message' => 'Post deleted']);
    });
    Route::get('/posts/{slug}/edit', function(Request $request, $slug) {
        //Log::debug('Debugging data', ['post owner' => $request->user()->id]);
        
        $post = Post::where('slug', $slug)->first();

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        // Only admins or the owner of the post can edit
        if (!$request->user()->isAdmin() && $request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['post' => $post]);
    });

    Route::put('/posts/{slug}', function(Request $request, $slug) {
        $post = Post::where('slug', $slug)->first();
        Log::debug('Debugging data', ['post put request' => $request->user()->id]);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        if (!$request->user()->isAdmin() && $request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $post->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'slug' => Str::slug($validated['title']) . '-' . Str::random(6),
        ]);

        return response()->json(['post' => $post]);
    });
    // Comments
    Route::post('/posts/{id}/comments', function(Request $request, $id) {
        if ($request->user()->is_banned) {
            return response()->json(['message' => 'You are banned from commenting'], 403);
        }
        
        $validated = $request->validate([
            'content' => 'required|string',
        ]);
        
        $post = Post::find($id);
        
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }
        //Log::debug('Debugging data', ['data' => $request->user()->id]);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);
        
        return response()->json(['comment' => $comment->load('user')], 201);
    });
    
    // Admin routes
    Route::middleware('can:admin')->group(function() {
        Route::post('/users/{id}/ban', function(Request $request, $id) {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }
            
            $user->update(['is_banned' => true]);
            
            return response()->json(['message' => 'User banned']);
        });
        
        Route::post('/users/{id}/unban', function(Request $request, $id) {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }
            
            $user->update(['is_banned' => false]);
            
            return response()->json(['message' => 'User unbanned']);
        });
    });
});

