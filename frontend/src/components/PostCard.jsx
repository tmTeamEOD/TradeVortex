import React from "react";

const PostCard = ({ post, onEdit, onDelete }) => (
  <div className="post-card">
    <h2>{post.title}</h2>
    <p>{post.content}</p>
    <div>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  </div>
);

export default PostCard;
